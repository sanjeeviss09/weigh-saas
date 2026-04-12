"""
LogiCrate PC Agent v4.2
Standalone self-contained agent for Windows.
Watches a folder for PDF files and uploads them to the LogiCrate cloud.
No Python or external tools required after compilation.
"""

import os
import sys
import time
import json
import hashlib
import logging
import ctypes
import threading
import requests
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ─── Configuration ────────────────────────────────────────────────────────────
CONFIG_FILE = Path(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__)) / "config.json"
LOG_FILE    = Path(os.path.expanduser("~")) / "AppData" / "Local" / "LogiCrate" / "agent.log"

# ─── Load Config ─────────────────────────────────────────────────────────────
def load_config():
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Config read error: {e}")
    # Default fallback
    return {
        "api_url": "https://weigh-saas.onrender.com",
        "company_id": "",
        "watch_dir": r"C:\WeighmentPDFs",
        "api_key": ""
    }

# ─── Setup Logging ────────────────────────────────────────────────────────────
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

config = load_config()
API_URL    = config.get("api_url", "https://weigh-saas.onrender.com").rstrip("/")
COMPANY_ID = config.get("company_id", "")
WATCH_DIR  = config.get("watch_dir", r"C:\WeighmentPDFs")
API_KEY    = config.get("api_key", "")

# ─── Ensure watch folder exists ───────────────────────────────────────────────
Path(WATCH_DIR).mkdir(parents=True, exist_ok=True)

# ─── File hash tracking to avoid duplicates ───────────────────────────────────
processed_hashes = set()

def get_file_hash(path: str) -> str:
    md5 = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()

def wait_for_stable(path: str, retries=5, delay=1.5) -> bool:
    prev = -1
    for _ in range(retries):
        try:
            size = os.path.getsize(path)
            if size == prev and size > 0:
                return True
            prev = size
        except OSError:
            pass
        time.sleep(delay)
    return False

def upload_pdf(path: str):
    filename = os.path.basename(path)
    try:
        if not wait_for_stable(path):
            logging.warning(f"File not stable, skipping: {filename}")
            return

        file_hash = get_file_hash(path)
        if file_hash in processed_hashes:
            logging.info(f"Already processed (in-memory): {filename}")
            return
        processed_hashes.add(file_hash)

        logging.info(f"Uploading: {filename}")
        with open(path, "rb") as f:
            response = requests.post(
                f"{API_URL}/upload-pdf",
                files={"file": (filename, f, "application/pdf")},
                data={
                    "company_id": COMPANY_ID,
                    "file_hash": file_hash,
                },
                headers={"X-API-Key": API_KEY} if API_KEY else {},
                timeout=60
            )

        if response.status_code == 200:
            logging.info(f"✓ Uploaded successfully: {filename}")
        elif response.status_code == 409:
            logging.info(f"Duplicate (server): {filename}")
        else:
            logging.error(f"Upload failed [{response.status_code}]: {filename} → {response.text[:200]}")

    except requests.ConnectionError:
        logging.error(f"No internet connection. Could not upload: {filename}")
    except Exception as e:
        logging.error(f"Unexpected error uploading {filename}: {e}")

# ─── Watchdog Handler ─────────────────────────────────────────────────────────
class PDFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(".pdf"):
            logging.info(f"New PDF detected: {event.src_path}")
            threading.Thread(target=upload_pdf, args=(event.src_path,), daemon=True).start()

    def on_modified(self, event):
        # Some printers trigger modified instead of created
        if not event.is_directory and event.src_path.lower().endswith(".pdf"):
            file_hash = None
            try:
                file_hash = get_file_hash(event.src_path)
            except Exception:
                return
            if file_hash and file_hash not in processed_hashes:
                logging.info(f"Modified PDF detected: {event.src_path}")
                threading.Thread(target=upload_pdf, args=(event.src_path,), daemon=True).start()

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    logging.info("=" * 60)
    logging.info("  LogiCrate PC Agent v4.2 — Starting")
    logging.info(f"  Watch folder : {WATCH_DIR}")
    logging.info(f"  Cloud URL    : {API_URL}")
    logging.info(f"  Company ID   : {COMPANY_ID or 'NOT SET'}")
    logging.info("=" * 60)

    if not COMPANY_ID:
        logging.error("COMPANY_ID is not set in config.json. Please re-download your config file from the dashboard.")

    observer = Observer()
    observer.schedule(PDFHandler(), path=WATCH_DIR, recursive=False)
    observer.start()
    logging.info(f"Agent running. Watching: {WATCH_DIR}")

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    logging.info("Agent stopped.")

if __name__ == "__main__":
    main()
