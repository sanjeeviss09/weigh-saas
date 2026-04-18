@echo off
title LogiCrate Agent - One Click Setup
color 0A
echo.
echo ============================================================
echo    LogiCrate PC Agent - Automatic Setup
echo    Just sit back, this will take 1-2 minutes...
echo ============================================================
echo.

:: ─── Step 1: Check if Python is installed ──────────────────────────
echo [~] Checking if Python is installed...
python --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python is already installed.
    goto :install_deps
)

py --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python is already installed.
    set "PYTHON_CMD=py"
    goto :install_deps
)

:: ─── Step 2: Python not found — download and install silently ──────
echo [!] Python not found. Downloading Python installer...
echo     (This may take a minute depending on your internet speed)
echo.

powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe' -OutFile '%TEMP%\python_installer.exe' }"

if not exist "%TEMP%\python_installer.exe" (
    echo [X] Failed to download Python. Please check your internet connection.
    echo     You can also install Python manually from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Download complete. Installing Python silently...
echo     (This takes about 30 seconds - DO NOT close this window)
echo.

"%TEMP%\python_installer.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1

timeout /t 5 /nobreak >nul

set "PATH=%LOCALAPPDATA%\Programs\Python\Python312\;%LOCALAPPDATA%\Programs\Python\Python312\Scripts\;%PATH%"

python --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python installed successfully!
) else (
    echo [!] Python installed but PATH may need a restart.
    echo     Please RESTART your computer and run this file again.
    pause
    exit /b 1
)

del "%TEMP%\python_installer.exe" >nul 2>&1

:install_deps
echo.
echo [~] Installing required libraries...
pip install requests watchdog pdfplumber >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Libraries installed successfully!
) else (
    py -m pip install requests watchdog pdfplumber >nul 2>&1
    if %errorlevel%==0 (
        echo [OK] Libraries installed successfully!
    ) else (
        echo [X] Failed to install libraries. Please check your internet.
        pause
        exit /b 1
    )
)

:: ─── Step 3: Create watch folder ───────────────────────────────────
echo.
echo [~] Preparing agent...

if not exist "C:\Weighments" (
    mkdir "C:\Weighments"
    echo [OK] Created watch folder: C:\Weighments
) else (
    echo [OK] Watch folder exists: C:\Weighments
)

:: ─── Step 4: Create agent script inline ────────────────────────────
:: Force a fresh start
set "AGENT_FILE=%~dp0logicrate_agent.py"
if exist "%AGENT_FILE%" del "%AGENT_FILE%"

echo [~] Creating agent script...

echo import os, sys, time, json, hashlib, sqlite3, requests> "%AGENT_FILE%"
echo from pathlib import Path>> "%AGENT_FILE%"
echo from watchdog.observers import Observer>> "%AGENT_FILE%"
echo from watchdog.events import FileSystemEventHandler>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo VERSION = "5.0.2">> "%AGENT_FILE%"
echo WATCH_DIR = r"C:\Weighments">> "%AGENT_FILE%"
echo CREDENTIALS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".logirate")>> "%AGENT_FILE%"
echo QUEUE_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "queue.db")>> "%AGENT_FILE%"
echo BACKEND_URL = os.environ.get("LOGICRATE_API", "https://logicrate-backend.onrender.com")>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def banner():>> "%AGENT_FILE%"
echo     print("\n" + "=" * 58)>> "%AGENT_FILE%"
echo     print(f"   LogiCrate PC Agent v{VERSION}")>> "%AGENT_FILE%"
echo     print("   Automated Weighbridge PDF Sync")>> "%AGENT_FILE%"
echo     print("=" * 58)>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def info(msg): print(f"  [v] {msg}")>> "%AGENT_FILE%"
echo def warn(msg): print(f"  [!] {msg}")>> "%AGENT_FILE%"
echo def error(msg): print(f"  [X] {msg}")>> "%AGENT_FILE%"
echo def status(msg): print(f"  [~] {msg}")>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def load_credentials():>> "%AGENT_FILE%"
echo     if not os.path.exists(CREDENTIALS_FILE): return None>> "%AGENT_FILE%"
echo     try:>> "%AGENT_FILE%"
echo         with open(CREDENTIALS_FILE, "r") as f: creds = json.load(f)>> "%AGENT_FILE%"
echo         if creds.get("api_key") and creds.get("company_id") and creds.get("station_name"): return creds>> "%AGENT_FILE%"
echo     except: pass>> "%AGENT_FILE%"
echo     return None>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def save_credentials(creds):>> "%AGENT_FILE%"
echo     with open(CREDENTIALS_FILE, "w") as f: json.dump(creds, f, indent=2)>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def setup_first_run():>> "%AGENT_FILE%"
echo     print("\n  First-time setup detected.")>> "%AGENT_FILE%"
echo     print("  You need your station's Join Code to connect.\n")>> "%AGENT_FILE%"
echo     print("  Your Join Code looks like: GOLD-XXXXXX")>> "%AGENT_FILE%"
echo     print("  (You can find it in your LogiCrate dashboard)\n")>> "%AGENT_FILE%"
echo     while True:>> "%AGENT_FILE%"
echo         join_code = input("  Enter your station Join Code: ").strip().upper()>> "%AGENT_FILE%"
echo         if not join_code:>> "%AGENT_FILE%"
echo             warn("Join code cannot be empty. Try again.")>> "%AGENT_FILE%"
echo             continue>> "%AGENT_FILE%"
echo         status(f"Validating join code: {join_code} ...")>> "%AGENT_FILE%"
echo         try:>> "%AGENT_FILE%"
echo             r = requests.get(f"{BACKEND_URL}/validate-join-code", params={"code": join_code}, timeout=15)>> "%AGENT_FILE%"
echo             if r.status_code == 200:>> "%AGENT_FILE%"
echo                 data = r.json()>> "%AGENT_FILE%"
echo                 company_id = data["company_id"]>> "%AGENT_FILE%"
echo                 station_name = data["company_name"]>> "%AGENT_FILE%"
echo                 api_key = "">> "%AGENT_FILE%"
echo                 try:>> "%AGENT_FILE%"
echo                     api_r = requests.get(f"{BACKEND_URL}/agent/config/{company_id}", timeout=15)>> "%AGENT_FILE%"
echo                     if api_r.status_code == 200: api_key = api_r.json().get("api_key", "")>> "%AGENT_FILE%"
echo                 except: pass>> "%AGENT_FILE%"
echo                 creds = {"company_id": company_id, "station_name": station_name, "api_key": api_key, "join_code": join_code, "backend_url": BACKEND_URL}>> "%AGENT_FILE%"
echo                 save_credentials(creds)>> "%AGENT_FILE%"
echo                 print()>> "%AGENT_FILE%"
echo                 info(f"Station linked: {station_name}")>> "%AGENT_FILE%"
echo                 info(f"Company ID: {company_id}")>> "%AGENT_FILE%"
echo                 return creds>> "%AGENT_FILE%"
echo             elif r.status_code == 404: error("Join code not found. Please check and try again.")>> "%AGENT_FILE%"
echo             else: error(f"Server error ({r.status_code}). Try again.")>> "%AGENT_FILE%"
echo         except requests.ConnectionError: error(f"Cannot reach server at {BACKEND_URL}")>> "%AGENT_FILE%"
echo         except Exception as e: error(f"Unexpected error: {e}")>> "%AGENT_FILE%"
echo         retry = input("\n  Try again? (y/n): ").strip().lower()>> "%AGENT_FILE%"
echo         if retry != "y":>> "%AGENT_FILE%"
echo             print("\n  Exiting setup. Run the agent again when ready.")>> "%AGENT_FILE%"
echo             sys.exit(0)>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def init_db():>> "%AGENT_FILE%"
echo     conn = sqlite3.connect(QUEUE_DB)>> "%AGENT_FILE%"
echo     c = conn.cursor()>> "%AGENT_FILE%"
echo     c.execute("CREATE TABLE IF NOT EXISTS payload_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, file_name TEXT, file_hash TEXT, raw_text TEXT)")>> "%AGENT_FILE%"
echo     conn.commit(); conn.close()>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def queue_offline(fn, fh, rt):>> "%AGENT_FILE%"
echo     conn = sqlite3.connect(QUEUE_DB); c = conn.cursor()>> "%AGENT_FILE%"
echo     c.execute("INSERT INTO payload_queue (file_name, file_hash, raw_text) VALUES (?, ?, ?)", (fn, fh, rt))>> "%AGENT_FILE%"
echo     conn.commit(); conn.close(); warn(f"Queued offline: {fn}")>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def flush_queue(api_url, api_key):>> "%AGENT_FILE%"
echo     conn = sqlite3.connect(QUEUE_DB); c = conn.cursor()>> "%AGENT_FILE%"
echo     c.execute("SELECT id, file_name, file_hash, raw_text FROM payload_queue"); rows = c.fetchall()>> "%AGENT_FILE%"
echo     if not rows: conn.close(); return>> "%AGENT_FILE%"
echo     status(f"Retrying {len(rows)} queued record(s)...")>> "%AGENT_FILE%"
echo     for row in rows:>> "%AGENT_FILE%"
echo         rid, fn, fh, rt = row>> "%AGENT_FILE%"
echo         if push_to_api(api_url, api_key, fn, fh, rt):>> "%AGENT_FILE%"
echo             c.execute("DELETE FROM payload_queue WHERE id=?", (rid,)); conn.commit(); info(f"Queued upload success: {fn}")>> "%AGENT_FILE%"
echo         else: warn("Server still unreachable."); break>> "%AGENT_FILE%"
echo     conn.close()>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def wait_for_file(fp, retries=10, delay=1.0):>> "%AGENT_FILE%"
echo     prev = -1; r = 0>> "%AGENT_FILE%"
echo     while r ^< retries:>> "%AGENT_FILE%"
echo         try:>> "%AGENT_FILE%"
echo             cur = os.path.getsize(fp)>> "%AGENT_FILE%"
echo             if cur == prev and cur ^> 0: time.sleep(0.5); return True>> "%AGENT_FILE%"
echo             prev = cur>> "%AGENT_FILE%"
echo         except OSError: pass>> "%AGENT_FILE%"
echo         r += 1; time.sleep(delay)>> "%AGENT_FILE%"
echo     return False>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def extract_text(fp):>> "%AGENT_FILE%"
echo     try:>> "%AGENT_FILE%"
echo         import pdfplumber; text = "">> "%AGENT_FILE%"
echo         with pdfplumber.open(fp) as pdf:>> "%AGENT_FILE%"
echo             for page in pdf.pages:>> "%AGENT_FILE%"
echo                 pt = page.extract_text()>> "%AGENT_FILE%"
echo                 if pt: text += pt + "\n">> "%AGENT_FILE%"
echo         return text.strip()>> "%AGENT_FILE%"
echo     except Exception as e: error(f"PDF read error: {e}"); return "">> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def file_hash(fp):>> "%AGENT_FILE%"
echo     md5 = hashlib.md5()>> "%AGENT_FILE%"
echo     with open(fp, "rb") as f:>> "%AGENT_FILE%"
echo         for chunk in iter(lambda: f.read(4096), b""): md5.update(chunk)>> "%AGENT_FILE%"
echo     return md5.hexdigest()>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def push_to_api(api_url, api_key, fn, fh, rt):>> "%AGENT_FILE%"
echo     headers = {"Content-Type": "application/json"}>> "%AGENT_FILE%"
echo     if api_key: headers["x-api-key"] = api_key>> "%AGENT_FILE%"
echo     try:>> "%AGENT_FILE%"
echo         r = requests.post(api_url, json={"file_name": fn, "file_hash": fh, "raw_text": rt}, headers=headers, timeout=15)>> "%AGENT_FILE%"
echo         r.raise_for_status(); return True>> "%AGENT_FILE%"
echo     except Exception as e: error(f"Upload failed ({fn}): {e}"); return False>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo class PDFHandler(FileSystemEventHandler):>> "%AGENT_FILE%"
echo     def __init__(self, api_url, api_key): self.api_url = api_url; self.api_key = api_key>> "%AGENT_FILE%"
echo     def on_created(self, event):>> "%AGENT_FILE%"
echo         if event.is_directory or not event.src_path.lower().endswith(".pdf"): return>> "%AGENT_FILE%"
echo         fn = os.path.basename(event.src_path); status(f"New PDF: {fn}")>> "%AGENT_FILE%"
echo         if not wait_for_file(event.src_path): warn(f"File not stable: {fn}"); return>> "%AGENT_FILE%"
echo         fh = file_hash(event.src_path); rt = extract_text(event.src_path)>> "%AGENT_FILE%"
echo         if not rt: warn(f"No text from: {fn}"); return>> "%AGENT_FILE%"
echo         info(f"Extracted {len(rt)} chars from {fn}")>> "%AGENT_FILE%"
echo         if push_to_api(self.api_url, self.api_key, fn, fh, rt): info(f"Uploaded: {fn}")>> "%AGENT_FILE%"
echo         else: queue_offline(fn, fh, rt)>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo def main():>> "%AGENT_FILE%"
echo     banner()>> "%AGENT_FILE%"
echo     creds = load_credentials()>> "%AGENT_FILE%"
echo     if not creds: creds = setup_first_run()>> "%AGENT_FILE%"
echo     api_key = creds.get("api_key", ""); backend = creds.get("backend_url", BACKEND_URL)>> "%AGENT_FILE%"
echo     api_url = f"{backend}/api/upload">> "%AGENT_FILE%"
echo     print(); info(f"Station: {creds['station_name']}"); info(f"Backend: {backend}"); info(f"Watch folder: {WATCH_DIR}")>> "%AGENT_FILE%"
echo     os.makedirs(WATCH_DIR, exist_ok=True); init_db()>> "%AGENT_FILE%"
echo     handler = PDFHandler(api_url, api_key); observer = Observer()>> "%AGENT_FILE%"
echo     observer.schedule(handler, path=WATCH_DIR, recursive=False); observer.start()>> "%AGENT_FILE%"
echo     print(); print("  " + "-" * 50)>> "%AGENT_FILE%"
echo     info("Agent is RUNNING. Watching for PDFs...")>> "%AGENT_FILE%"
echo     info("Minimize this window. Do NOT close it.")>> "%AGENT_FILE%"
echo     info("Press Ctrl+C to stop.")>> "%AGENT_FILE%"
echo     print("  " + "-" * 50); print()>> "%AGENT_FILE%"
echo     try:>> "%AGENT_FILE%"
echo         while True: time.sleep(30); flush_queue(api_url, api_key)>> "%AGENT_FILE%"
echo     except KeyboardInterrupt: print(); info("Agent stopped."); observer.stop()>> "%AGENT_FILE%"
echo     observer.join()>> "%AGENT_FILE%"
echo.>> "%AGENT_FILE%"
echo if __name__ == "__main__": main()>> "%AGENT_FILE%"

echo [OK] Agent script recreated perfectly.

:run_agent
echo.
echo ============================================================
echo    Setup Complete! Starting the LogiCrate Agent...
echo ============================================================
echo.
echo    IMPORTANT: Keep this window OPEN (you can minimize it).
echo    If this is your first time, you will be asked for
echo    your station Join Code below.
echo.
echo ------------------------------------------------------------

cd /d "%~dp0"
python logicrate_agent.py

echo.
echo ============================================================
echo    Agent stopped. Close this window or press any key.
echo ============================================================
pause
