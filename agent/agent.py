import os
import time
import hashlib
import sqlite3
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

WATCH_DIR = os.environ.get("WATCH_DIR", r"C:\WeighmentPDFs")
API_URL = os.environ.get("API_URL", "http://localhost:8000/api/upload")
API_KEY = os.environ.get("API_KEY", "your-secure-api-key")

os.makedirs(WATCH_DIR, exist_ok=True)

def init_db():
    conn = sqlite3.connect("queue.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS payload_queue
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  file_name TEXT,
                  file_hash TEXT,
                  raw_text TEXT)''')
    conn.commit()
    conn.close()

def wait_for_file_stability(file_path: str, max_retries=10, delay=1.0) -> bool:
    previous_size = -1
    retries = 0
    while retries < max_retries:
        try:
            current_size = os.path.getsize(file_path)
            if current_size == previous_size and current_size > 0:
                time.sleep(0.5)
                return True
            previous_size = current_size
        except OSError:
            pass
        retries += 1
        time.sleep(delay)
    return False

def process_pdf(file_path: str) -> str:
    extracted_text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        print(f"pdfplumber exception on {file_path}: {e}")

    if not extracted_text.strip():
        print("Fallback OCR initiated...")
        try:
            images = convert_from_path(file_path)
            for img in images:
                extracted_text += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            print(f"OCR Exception: {e}")

    return extracted_text.strip()

def generate_file_hash(file_path: str) -> str:
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()

def push_to_api(file_name, file_hash, raw_text):
    headers = {"x-api-key": API_KEY, "Content-Type": "application/json"}
    payload = {"file_name": file_name, "file_hash": file_hash, "raw_text": raw_text}
    
    try:
        r = requests.post(API_URL, json=payload, headers=headers, timeout=10)
        r.raise_for_status()
        return True
    except Exception as e:
        print(f"API Error ({file_name}): {e}")
        return False

def flush_queue():
    """Attempt to upload all queued offline records."""
    conn = sqlite3.connect("queue.db")
    c = conn.cursor()
    c.execute("SELECT id, file_name, file_hash, raw_text FROM payload_queue")
    rows = c.fetchall()
    
    for row in rows:
        record_id, fname, fhash, rtext = row
        print(f"Retrying offline record: {fname}")
        success = push_to_api(fname, fhash, rtext)
        if success:
            c.execute("DELETE FROM payload_queue WHERE id=?", (record_id,))
            conn.commit()
        else:
            print("Server still unreachable. Sleeping queue.")
            break
    conn.close()

class PDFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(".pdf"):
            print(f"Detected: {event.src_path}")
            if wait_for_file_stability(event.src_path):
                file_hash = generate_file_hash(event.src_path)
                file_name = os.path.basename(event.src_path)
                raw_text = process_pdf(event.src_path)
                if not raw_text:
                    print("Failed to get text, skipping.")
                    return
                
                success = push_to_api(file_name, file_hash, raw_text)
                if not success:
                    print("Network offline. Saving to local SQLite queue.")
                    conn = sqlite3.connect("queue.db")
                    c = conn.cursor()
                    c.execute("INSERT INTO payload_queue (file_name, file_hash, raw_text) VALUES (?, ?, ?)", 
                              (file_name, file_hash, raw_text))
                    conn.commit()
                    conn.close()
            else:
                print("File stability timeout.")

def run_agent():
    init_db()
    event_handler = PDFHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_DIR, recursive=False)
    observer.start()
    print(f"LogiRate Edge Agent running. Watching {WATCH_DIR}...")
    
    try:
        while True:
            time.sleep(30)
            flush_queue()
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    run_agent()
