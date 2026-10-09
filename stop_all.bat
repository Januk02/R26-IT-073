@echo off
title EduSoul - Stop All Services
cls
echo ==============================================================================
echo                      Stopping All EduSoul Services
echo ==============================================================================
echo.

for %%P in (5173 8006 8008 8000 8001 5000) do (
    echo Checking port %%P...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo   Terminating process PID %%a on port %%P...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ==============================================================================
echo  All services on ports 5173, 8006, 8008, 8000, 8001, 5000 stopped!
echo ==============================================================================
pause
