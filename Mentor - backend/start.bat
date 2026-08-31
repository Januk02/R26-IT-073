@echo off
chcp 65001 >nul
echo 🚀 Starting Mentorship Matching API Backend
echo ===========================================

REM Check if venv exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate venv and install requirements
echo 📦 Installing requirements...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Create directories if needed
if not exist "models" mkdir models
if not exist "data" mkdir data

REM Start the server
echo.
echo 🌐 Starting Flask server...
echo 📍 API: http://localhost:5000
echo 📍 Health: http://localhost:5000/api/health
echo 📍 Stats: http://localhost:5000/api/stats
echo.
echo Press Ctrl+C to stop
echo.

python app.py

pause
