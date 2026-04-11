import os
import time
import asyncio
import hashlib
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from processor import process_pdf
from ai_engine import extract_weighment_data
from decision_engine import process_weighment_transaction, handle_duplicate, handle_error
from database import db

WATCH_DIR = os.environ.get("WATCH_DIR", "./test_pdfs")
os.makedirs(WATCH_DIR, exist_ok=True)
DEFAULT_COMPANY_ID = os.environ.get("DEFAULT_COMPANY_ID")

class PDFHandler(FileSystemEventHandler):
    def __init__(self, queue: asyncio.Queue):
        self.queue = queue
        
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(".pdf"):
            print(f"New PDF detected: {event.src_path}")
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self.queue.put(event.src_path))
            except Exception as e:
                print("Failed to dispatch to queue", e)

async def wait_for_file_stability(file_path: str, max_retries=5, delay=1) -> bool:
    """Ensure file size is stable (not locked/writing) before releasing to processing."""
    previous_size = -1
    retries = 0
    while retries < max_retries:
        try:
            current_size = os.path.getsize(file_path)
            if current_size == previous_size and current_size > 0:
                await asyncio.sleep(0.5)
                return True
            previous_size = current_size
        except OSError:
            pass
        retries += 1
        await asyncio.sleep(delay)
    return False

def generate_file_hash(file_path: str) -> str:
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()

async def process_pdf_worker(queue: asyncio.Queue):
    """Background worker draining the processing queue."""
    while True:
        file_path = await queue.get()
        filename = os.path.basename(file_path)
        try:
            is_stable = await wait_for_file_stability(file_path)
            if not is_stable:
                print(f"File {filename} is unstable or locked.")
                continue
                
            file_hash = generate_file_hash(file_path)
            res = db.table("duplicate_logs").select("id").eq("hash", file_hash).execute()
            if res.data:
                continue 
                
            dup_res = db.table("weighment_files").select("id").eq("file_hash", file_hash).execute()
            if dup_res.data:
                handle_duplicate(filename, file_hash, "Binary exact match", DEFAULT_COMPANY_ID)
                continue

            raw_text = process_pdf(file_path)
            if not raw_text:
                handle_error(filename, raw_text, "Failed to extract any text", None, DEFAULT_COMPANY_ID)
                continue

            corrections_res = []
            try:
                if DEFAULT_COMPANY_ID:
                    c_res = db.table("corrections").select("*").eq("company_id", DEFAULT_COMPANY_ID).order("created_at", desc=True).limit(5).execute()
                    corrections_res = c_res.data
            except Exception: pass

            try:
                parsed_data = await extract_weighment_data(raw_text, past_corrections=corrections_res)
            except Exception as e:
                handle_error(filename, raw_text, str(e), None, DEFAULT_COMPANY_ID)
                continue

            file_record = {
                "company_id": DEFAULT_COMPANY_ID,
                "file_name": filename,
                "file_hash": file_hash,
                "raw_text": raw_text,
                "parsed_json": parsed_data,
                "status": "processed"
            }
            
            inserted = db.table("weighment_files").insert(file_record).execute()
            file_id = inserted.data[0]["id"]
            
            process_weighment_transaction(parsed_data, file_id, DEFAULT_COMPANY_ID)
            print(f"Successfully processed {filename}")
            
        except Exception as e:
            print(f"Catastrophic failure processing {filename}: {e}")
            handle_error(filename, "", f"Catastrophic: {str(e)}", None, DEFAULT_COMPANY_ID)
        finally:
            queue.task_done()

def start_watcher(loop, queue):
    loop.create_task(process_pdf_worker(queue))
    event_handler = PDFHandler(queue)
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_DIR, recursive=False)
    observer.start()
    print(f"Started monitoring folder: {WATCH_DIR}")
    return observer
