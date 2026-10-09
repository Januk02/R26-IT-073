@echo off
title Career Pathway AI Microservice (FastAPI + Neo4j)
echo ========================================================
echo   Starting Career Pathway AI Engine (Port: 8000)...
echo ========================================================
cd /d "%~dp0ai-engine\models"
if exist "..\venv\Scripts\python.exe" (
    "..\venv\Scripts\python.exe" api_server.py
) else (
    python api_server.py
)
pause
