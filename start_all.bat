@echo off
title EduSoul All-in-One Service Launcher
cls
echo ==============================================================================
echo                      Starting All EduSoul Services
echo ==============================================================================
echo.

set ROOT_DIR=%~dp0

if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set PY_EXEC=%ROOT_DIR%.venv\Scripts\python.exe
) else (
    set PY_EXEC=python
)

if exist "%ROOT_DIR%ai-engine\venv\Scripts\python.exe" (
    set M2_PY=%ROOT_DIR%ai-engine\venv\Scripts\python.exe
) else (
    set M2_PY=%PY_EXEC%
)

echo [1/5] Starting Member 1 Backend (Port 8006: Degree Recommender)...
start "EduSoul - Member 1 [Degree Recommender 8006]" cmd /k "cd /d "%ROOT_DIR%backend" && "%PY_EXEC%" flask_app.py"
timeout /t 2 /nobreak >nul

echo [2/5] Starting Member 2 Backend (Port 8008: Career Pathway AI)...
start "EduSoul - Member 2 [Career AI 8008]" cmd /k "cd /d "%ROOT_DIR%ai-engine\models" && "%M2_PY%" api_server.py"
timeout /t 2 /nobreak >nul

echo [3/5] Starting Member 3 Backend (Port 8001: Stress Analyser)...
start "EduSoul - Member 3 [Stress Analyser 8001]" cmd /k "cd /d "%ROOT_DIR%Stress Analyser\models" && "%PY_EXEC%" watch_data.py --serve"
timeout /t 2 /nobreak >nul

echo [4/5] Starting Member 4 Backend (Port 5000: Mentorship Matching)...
start "EduSoul - Member 4 [Mentorship 5000]" cmd /k "cd /d "%ROOT_DIR%Mentor - backend" && "%PY_EXEC%" app.py"
timeout /t 2 /nobreak >nul

echo [5/5] Starting Frontend App (EduSoul React/Vite Port 5173)...
start "EduSoul - Frontend [React/Vite 5173]" cmd /k "cd /d "%ROOT_DIR%edusoul-app" && npm run dev"

echo.
echo ==============================================================================
echo  All 5 services launched successfully!
echo ==============================================================================
echo.
echo  Frontend (Web App):     http://localhost:5173
echo  Member 1 Backend:       http://localhost:8006
echo  Member 2 Backend:       http://localhost:8008
echo  Member 3 Backend:       http://localhost:8001
echo  Member 4 Backend:       http://localhost:5000
echo.
echo ==============================================================================
echo To stop all services, run stop_all.bat or stop_all.ps1
echo ==============================================================================
pause
