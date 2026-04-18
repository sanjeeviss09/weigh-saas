"""
LogiCrate PC Agent v5.0
========================
Self-contained PDF watcher. No config.json required.
On first run, the user enters their station's Join Code.
The agent validates it, stores credentials locally, and begins watching.

Usage:
  python agent.py

Requirements:
  pip install requests watchdog pdfplumber
"""

import os
import sys
import time
import json
import hashlib
import sqlite3
import requests
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ─── CONSTANTS ─────────────────────────────────────────────────────────────────
VERSION = "5.0"
WATCH_DIR = r"C:\Weighments"
CREDENTIALS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".logirate")
QUEUE_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "queue.db")

# Backend URL — auto-detect or hardcode production
BACKEND_URL = os.environ.get("LOGICRATE_API", "https://logicrate-backend.onrender.com")

# ─── CONSOLE STYLE ─────────────────────────────────────────────────────────────
def banner():
    print("\n" + "=" * 58)
    print(f"   LogiCrate PC Agent v{VERSION}")
    print("   Automated Weighbridge PDF Sync")
    print("=" * 58)

def info(msg):
    print(f"  [✓] {msg}")

def warn(msg):
    print(f"  [!] {msg}")

def error(msg):
    print(f"  [✗] {msg}")

def status(msg):
    print(f"  [~] {msg}")

# ─── CREDENTIALS ───────────────────────────────────────────────────────────────
def load_credentials():
    """Load saved station credentials from .logirate file."""
    if not os.path.exists(CREDENTIALS_FILE):
        return None
    try:
        with open(CREDENTIALS_FILE, "r") as f:
            creds = json.load(f)
        if creds.get("api_key") and creds.get("company_id") and creds.get("station_name"):
            return creds
    except Exception:
        pass
    return None

def save_credentials(creds):
    """Save station credentials to .logirate file."""
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(creds, f, indent=2)

def setup_first_run():
    """Interactive first-run setup: ask for Join Code, validate with backend."""
    print("\n  First-time setup detected.")
    print("  You need your station's Join Code to connect.\n")
    print("  Your Join Code looks like: GOLD-XXXXXX")
    print("  (You can find it in your LogiCrate dashboard → Settings)\n")

    while True:
        join_code = input("  Enter your station Join Code: ").strip().upper()
        if not join_code:
            warn("Join code cannot be empty. Try again.")
            continue

        status(f"Validating join code: {join_code} ...")
        try:
            r = requests.get(
                f"{BACKEND_URL}/validate-join-code",
                params={"code": join_code},
                timeout=15
            )
            if r.status_code == 200:
                data = r.json()
                company_id = data["company_id"]
                station_name = data["company_name"]

                # Now fetch the API key for this station
                try:
                    api_r = requests.get(
                        f"{BACKEND_URL}/agent/config/{company_id}",
                        timeout=15
                    )
                    if api_r.status_code == 200:
                        config_data = api_r.json()
                        api_key = config_data.get("api_key", "")
                    else:
                        # Fallback: use join code as identifier
                        api_key = ""
                except Exception:
                    api_key = ""

                creds = {
                    "company_id": company_id,
                    "station_name": station_name,
                    "api_key": api_key,
                    "join_code": join_code,
                    "backend_url": BACKEND_URL,
                }
                save_credentials(creds)

                print()
                info(f"Station linked: {station_name}")
                info(f"Company ID: {company_id}")
                info(f"Credentials saved to: {CREDENTIALS_FILE}")
                return creds

            elif r.status_code == 404:
                error("Join code not found. Please check and try again.")
            else:
                error(f"Server error ({r.status_code}). Try again.")

        except requests.ConnectionError:
            error(f"Cannot reach server at {BACKEND_URL}")
            error("Check your internet connection and try again.")
        except Exception as e:
            error(f"Unexpected error: {e}")

        retry = input("\n  Try again? (y/n): ").strip().lower()
        if retry != "y":
            print("\n  Exiting setup. Run the agent again when ready.")
            sys.exit(0)


# ─── OFFLINE QUEUE (SQLite) ────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(QUEUE_DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS payload_queue
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  file_name TEXT,
                  file_hash TEXT,
                  raw_text TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def queue_offline(file_name, file_hash, raw_text):
    conn = sqlite3.connect(QUEUE_DB)
    c = conn.cursor()
    c.execute("INSERT INTO payload_queue (file_name, file_hash, raw_text) VALUES (?, ?, ?)",
              (file_name, file_hash, raw_text))
    conn.commit()
    conn.close()
    warn(f"Queued offline: {file_name}")

def flush_queue(api_url, api_key):
    """Retry uploading any queued records."""
    conn = sqlite3.connect(QUEUE_DB)
    c = conn.cursor()
    c.execute("SELECT id, file_name, file_hash, raw_text FROM payload_queue")
    rows = c.fetchall()

    if not rows:
        conn.close()
        return

    status(f"Retrying {len(rows)} queued record(s)...")
    for row in rows:
        record_id, fname, fhash, rtext = row
        success = push_to_api(api_url, api_key, fname, fhash, rtext)
        if success:
            c.execute("DELETE FROM payload_queue WHERE id=?", (record_id,))
            conn.commit()
            info(f"Queued upload success: {fname}")
        else:
            warn("Server still unreachable. Will retry next cycle.")
            break
    conn.close()


# ─── PDF PROCESSING ────────────────────────────────────────────────────────────
def wait_for_file(file_path, max_retries=10, delay=1.0):
    """Wait until a file is fully written to disk."""
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

def extract_text(file_path):
    """Extract text from PDF using pdfplumber (no OCR dependency)."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        error(f"PDF read error: {e}")
        return ""

def file_hash(file_path):
    """Generate MD5 hash for duplicate detection."""
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()


# ─── API UPLOAD ────────────────────────────────────────────────────────────────
def push_to_api(api_url, api_key, file_name, fhash, raw_text):
    """Upload extracted text to the LogiCrate backend."""
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key

    payload = {
        "file_name": file_name,
        "file_hash": fhash,
        "raw_text": raw_text,
    }

    try:
        r = requests.post(api_url, json=payload, headers=headers, timeout=15)
        r.raise_for_status()
        return True
    except Exception as e:
        error(f"Upload failed ({file_name}): {e}")
        return False


# ─── FILE WATCHER ──────────────────────────────────────────────────────────────
class PDFHandler(FileSystemEventHandler):
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key

    def on_created(self, event):
        if event.is_directory:
            return
        if not event.src_path.lower().endswith(".pdf"):
            return

        fname = os.path.basename(event.src_path)
        status(f"New PDF detected: {fname}")

        if not wait_for_file(event.src_path):
            warn(f"File not stable, skipping: {fname}")
            return

        fhash = file_hash(event.src_path)
        raw_text = extract_text(event.src_path)

        if not raw_text:
            warn(f"Could not extract text from: {fname}")
            return

        info(f"Extracted {len(raw_text)} characters from {fname}")

        success = push_to_api(self.api_url, self.api_key, fname, fhash, raw_text)
        if success:
            info(f"✓ Uploaded: {fname}")
        else:
            queue_offline(fname, fhash, raw_text)


# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    banner()

    # 1. Load or setup credentials
    creds = load_credentials()
    if not creds:
        creds = setup_first_run()

    company_id = creds["company_id"]
    station_name = creds["station_name"]
    api_key = creds.get("api_key", "")
    backend = creds.get("backend_url", BACKEND_URL)
    api_url = f"{backend}/api/upload"

    print()
    info(f"Station: {station_name}")
    info(f"Backend: {backend}")
    info(f"Watch folder: {WATCH_DIR}")

    # 2. Create watch folder if missing
    os.makedirs(WATCH_DIR, exist_ok=True)

    # 3. Init offline queue
    init_db()

    # 4. Start watcher
    handler = PDFHandler(api_url, api_key)
    observer = Observer()
    observer.schedule(handler, path=WATCH_DIR, recursive=False)
    observer.start()

    print()
    print("  " + "─" * 50)
    info("Agent is RUNNING. Watching for PDFs...")
    info("Minimize this window — do NOT close it.")
    info("Press Ctrl+C to stop.")
    print("  " + "─" * 50)
    print()

    try:
        while True:
            time.sleep(30)
            flush_queue(api_url, api_key)
    except KeyboardInterrupt:
        print()
        info("Agent stopped by user.")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
