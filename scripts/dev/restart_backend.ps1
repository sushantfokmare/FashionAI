# Restart Backend Server Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Restarting Backend Server with New Routes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "project\backend"
Set-Location $backendPath

Write-Host "Backend directory: $backendPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please manually restart your backend server:" -ForegroundColor Green
Write-Host "1. Go to the terminal running 'npm start'" -ForegroundColor White
Write-Host "2. Press Ctrl+C to stop it" -ForegroundColor White
Write-Host "3. Run 'npm start' again" -ForegroundColor White
Write-Host ""
Write-Host "Or start a new backend server with:" -ForegroundColor Green
Write-Host "   cd project\backend" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
