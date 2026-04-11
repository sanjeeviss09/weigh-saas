import os
import sys
import time
import json
import shutil
import hashlib
import threading
import subprocess
import requests
import pdfplumber
import winreg
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

try:
    import tkinter as tk
    from tkinter import ttk, messagebox
    HAS_TK = True
except ImportError:
    HAS_TK = False

# ─── Global Error Logger ─────────────────────────────────────────────────────
def log_fatal_error(msg):
    with open(os.path.join(SCRIPT_DIR, "setup_error.log"), "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    print(f"FATAL: {msg}")

try:
    import requests
    import pdfplumber
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError as e:
    log_fatal_error(f"Missing dependency: {e}. Run 'pip install requests pdfplumber watchdog'")

# ─── Config Manager ──────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        # Create default config if missing
        default_config = {
            "api_url": "http://127.0.0.1:8000",
            "api_key": "YOUR-API-KEY-HERE",
            "company_id": "",
            "watch_folder": "C:\\LogiRate\\PDFs",
            "setup_complete": False,
            "first_run": True
        }
        save_config(default_config)
        return default_config
        
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_config(cfg):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=4)

CONFIG = load_config()

API_KEY = CONFIG.get("api_key")
API_URL = CONFIG.get("api_url", "http://127.0.0.1:8000")
COMPANY_ID = CONFIG.get("company_id")
WATCH_DIR = os.path.abspath(CONFIG.get("watch_folder", "C:\\LogiRate\\PDFs"))
ARCHIVE_DIR = os.path.join(WATCH_DIR, "archive")

# ─── Registry System for Auto-Start ─────────────────────────────────────────
def add_to_startup():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r'Software\Microsoft\Windows\CurrentVersion\Run', 0, winreg.KEY_SET_VALUE)
        # Assuming the executable is agent.exe
        exe_path = sys.executable if getattr(sys, 'frozen', False) else os.path.abspath(__file__)
        winreg.SetValueEx(key, "LogiRateAgent", 0, winreg.REG_SZ, f'"{exe_path}"')
        winreg.CloseKey(key)
        return True
    except Exception as e:
        print(f"Failed to add to startup: {e}")
        return False

# ─── UI Wizard (Tkinter) ─────────────────────────────────────────────────────

# ─── Simple CLI Setup ────────────────────────────────────────────────────────
def run_setup():
    print("=== LogiRate Agent Setup ===")
    print(f"Watch Directory: {WATCH_DIR}")
    os.makedirs(WATCH_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    
    confirm = input(f"Create background service for {WATCH_DIR}? (y/n): ")
    if confirm.lower() == 'y':
        add_to_startup()
        CONFIG["first_run"] = False
        CONFIG["setup_complete"] = True
        save_config(CONFIG)
        print("Setup complete. Agent will now run in background.")
        return True
    return False


# ─── Utility Functions ───────────────────────────────────────────────────

def wait_for_file_stability(file_path: str, max_retries=10, delay=1.0) -> bool:
    previous_size = -1
    retries = 0
    while retries < max_retries:
        try:
            current_size = os.path.getsize(file_path)
            if current_size == previous_size and current_size > 0:
                time.sleep(1) 
                return True
            previous_size = current_size
        except OSError:
            pass
        retries += 1
        time.sleep(delay)
    return False

def generate_file_hash(file_path: str) -> str:
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()

def extract_text(file_path: str) -> str:
    extracted_text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        print(f"Extraction error on {file_path}: {e}")
    return extracted_text.strip()

# ─── Processing Logic ────────────────────────────────────────────────────

def process_file(file_path: str):
    filename = os.path.basename(file_path)
    print(f"[{time.strftime('%H:%M:%S')}] Detected: {filename}")
    
    if not wait_for_file_stability(file_path):
        print(f"[{time.strftime('%H:%M:%S')}] Error: File {filename} unstable.")
        return

    file_hash = generate_file_hash(file_path)
    print(f"[{time.strftime('%H:%M:%S')}] Extracting text from {filename}...")
    raw_text = extract_text(file_path)
    
    if not raw_text:
        print(f"[{time.strftime('%H:%M:%S')}] Error: No text found. Archive as failed.")
        shutil.move(file_path, os.path.join(ARCHIVE_DIR, f"failed_{filename}"))
        return

    payload = {
        "file_name": filename,
        "file_hash": file_hash,
        "raw_text": raw_text,
        "company_id": COMPANY_ID
    }
    
    headers = { "Content-Type": "application/json" }
    if API_KEY and API_KEY != "YOUR-API-KEY-HERE":
        headers["x-api-key"] = API_KEY

    print(f"[{time.strftime('%H:%M:%S')}] Uploading {filename} to {API_URL}...")
    try:
        response = requests.post(f"{API_URL}/api/upload", json=payload, headers=headers)
        if response.status_code in [200, 201, 202]:
            print(f"[{time.strftime('%H:%M:%S')}] Success: {filename} uploaded.")
            shutil.move(file_path, os.path.join(ARCHIVE_DIR, filename))
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Server Error ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Connection Error: {str(e)}")

# ─── Watchdog Observer ───────────────────────────────────────────────────

class PDFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(".pdf"):
            threading.Thread(target=process_file, args=(event.src_path,), daemon=True).start()

def run_silent_agent():
    print(f"LogiRate PC Agent Running in Background...")
    print(f"API URL: {API_URL}")
    print(f"Watching: {WATCH_DIR}")
    
    os.makedirs(WATCH_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    
    event_handler = PDFHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_DIR, recursive=False)
    observer.start()
    
    # Process backlog
    existing_files = [f for f in os.listdir(WATCH_DIR) if f.lower().endswith('.pdf')]
    for file in existing_files:
        threading.Thread(target=process_file, args=(os.path.join(WATCH_DIR, file),), daemon=True).start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

def main():
    print(f"[{time.strftime('%H:%M:%S')}] LogiCrate Agent Initializing...")
    
    if CONFIG.get("first_run", True):
        success = run_setup()
        if success:
            run_silent_agent()
        else:
            print("Setup aborted.")
    else:
        run_silent_agent()

if __name__ == "__main__":
    main()
