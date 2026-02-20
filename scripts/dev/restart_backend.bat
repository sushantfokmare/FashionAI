@echo off
echo ================================================
echo   Restarting Backend Server with New Routes
echo ================================================
echo.
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting backend server on port 5000...
cd project\backend
start "Backend Server" cmd /k "npm start"

echo.
echo Backend server is starting...
echo Check the new window for server logs
echo.
echo ================================================
pause
