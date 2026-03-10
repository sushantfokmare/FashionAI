# Keep Render backend awake by pinging every 5 minutes
# Run this script: .\keep-render-awake.ps1

$url = "https://fashionai-fnpd.onrender.com/health"
$interval = 300 # 5 minutes in seconds

Write-Host "🚀 Keeping Render backend awake..." -ForegroundColor Green
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host "Interval: Every 5 minutes" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

while ($true) {
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            Write-Host "[$timestamp] ✅ Backend is awake (200 OK)" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] ⚠️  Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "[$timestamp] ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $interval
}
