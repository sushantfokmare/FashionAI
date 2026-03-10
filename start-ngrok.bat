@echo off
echo ========================================
echo   FashionAI - Start AI Service + Ngrok
echo ========================================
echo.

REM Check if AI service is already running
echo [1/3] Checking AI Service...
curl -s http://localhost:8000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ AI Service is already running on port 8000
) else (
    echo ✗ AI Service not running!
    echo.
    echo Please start AI service in another terminal:
    echo   cd project\ai_service
    echo   python app.py
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Ngrok Tunnel...
echo.
echo Make sure you have ngrok installed and in your PATH
echo Download from: https://ngrok.com/download
echo.
echo Running: ngrok http 8000
echo.
echo ⚠️  IMPORTANT: Keep this window open while your app is deployed!
echo.
echo Your ngrok URL will appear below.
echo Copy the "Forwarding" https URL and use it in your deployment.
echo.

REM Start ngrok (assumes it's in PATH or same directory)
ngrok http 8000

pause
