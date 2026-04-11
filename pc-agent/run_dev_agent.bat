@echo off
echo --------------------------------------------------
echo LogiRate PC Agent - Developer Run
echo --------------------------------------------------
echo.
echo 1. Checking and installing requirements...
pip install watchdog requests pdfplumber
echo.
echo 2. Launching LogiRate Setup Wizard...
python agent.py
echo.
echo If the window closed immediately, make sure Python is installed and in your PATH.
pause
