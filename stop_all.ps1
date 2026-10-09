Write-Host "==============================================================================" -ForegroundColor Red
Write-Host "                    Stopping All EduSoul Services                             " -ForegroundColor Red
Write-Host "==============================================================================" -ForegroundColor Red

$ports = @(5173, 8006, 8008, 8000, 8001, 5000)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -gt 0) {
                try {
                    $proc = Get-Process -Id $procId -ErrorAction Stop
                    Write-Host "  Stopping process $($proc.ProcessName) (PID: $procId) on port $port..." -ForegroundColor Cyan
                    Stop-Process -Id $procId -Force
                } catch {
                    # Process might have already terminated
                }
            }
        }
    }
}

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host " All services stopped!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
