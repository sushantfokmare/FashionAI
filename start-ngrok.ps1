# Start AI Service and Ngrok

# PowerShell script to run AI service and ngrok

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FashionAI - AI Service + Ngrok Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AI service is running
Write-Host "[1/2] Checking AI Service on port 8000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ AI Service is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ AI Service is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start AI service first:" -ForegroundColor Yellow
    Write-Host "  1. Open a new PowerShell terminal" -ForegroundColor White
    Write-Host "  2. cd project\ai_service" -ForegroundColor White
    Write-Host "  3. python app.py" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/2] Instructions for Ngrok:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Download ngrok from: https://ngrok.com/download" -ForegroundColor White
Write-Host "2. Extract to a folder (e.g., C:\ngrok)" -ForegroundColor White
Write-Host "3. Run in another terminal:" -ForegroundColor White
Write-Host "   cd C:\ngrok" -ForegroundColor Cyan
Write-Host "   .\ngrok.exe http 8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Copy the HTTPS URL that appears (e.g., https://abc123.ngrok-free.app)" -ForegroundColor White
Write-Host "5. Use this URL in your deployment configuration" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  KEEP NGROK RUNNING while your app is deployed!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
