Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                    Starting All EduSoul Services                             " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot
$pyExec = if (Test-Path "$rootDir\.venv\Scripts\python.exe") { "$rootDir\.venv\Scripts\python.exe" } else { "python" }
$m2Py = if (Test-Path "$rootDir\ai-engine\venv\Scripts\python.exe") { "$rootDir\ai-engine\venv\Scripts\python.exe" } else { $pyExec }

# 1. Member 1 Backend
Write-Host "[1/5] Starting Member 1 Backend (Port 8006: Degree Recommender)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\backend`" && `"$pyExec`" flask_app.py"

Start-Sleep -Seconds 2

# 2. Member 2 Backend
Write-Host "[2/5] Starting Member 2 Backend (Port 8008: Career Pathway AI)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\ai-engine\models`" && `"$m2Py`" api_server.py"

Start-Sleep -Seconds 2

# 3. Member 3 Backend
Write-Host "[3/5] Starting Member 3 Backend (Port 8001: Stress Analyser)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\Stress Analyser\models`" && `"$pyExec`" watch_data.py --serve"

Start-Sleep -Seconds 2

# 4. Member 4 Backend
Write-Host "[4/5] Starting Member 4 Backend (Port 5000: Mentorship Matching)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\Mentor - backend`" && `"$pyExec`" app.py"

Start-Sleep -Seconds 2

# 5. Frontend App
Write-Host "[5/5] Starting Frontend App (EduSoul React/Vite Port 5173)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$rootDir\edusoul-app`" && npm run dev"

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host " All 5 services launched successfully in separate windows!" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " Frontend:         http://localhost:5173"
Write-Host " Member 1 Backend: http://localhost:8006"
Write-Host " Member 2 Backend: http://localhost:8008"
Write-Host " Member 3 Backend: http://localhost:8001"
Write-Host " Member 4 Backend: http://localhost:5000"
Write-Host "`nTo stop all services, run: .\stop_all.ps1 or .\stop_all.bat" -ForegroundColor Gray
