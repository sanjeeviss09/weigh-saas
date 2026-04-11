@echo off
echo ==========================================
echo Logicrate PC Agent Setup
echo ==========================================

cd /d "%~dp0"

echo [1/3] Creating Python Virtual Environment...
python -m venv venv
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH! Please install Python 3.10+ first.
    pause
    exit /b
)

echo [2/3] Installing Dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check your internet connection.
    pause
    exit /b
)

echo [3/3] Setup complete!
echo You can test the agent below. To run it silently in the background every day, double-click "start_hidden.vbs".
echo.
pause

echo Starting Logicrate PC Agent in Console Mode...
python agent.py
pause
