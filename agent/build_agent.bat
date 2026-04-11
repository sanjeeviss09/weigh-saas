@echo off
echo Building LogiRate Edge Agent...
pip install pyinstaller watchdog pdfplumber pytesseract pdf2image requests
pyinstaller --onefile agent.py
echo Build complete. The executable is located in the dist folder.
pause
