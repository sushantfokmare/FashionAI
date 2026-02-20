@echo off
REM Setup and start the Fashion AI Service with GPU support

echo ===============================================
echo  Fashion AI Service - Setup and Start
echo ===============================================
echo.

REM Step 1: Check GPU
echo [1/4] Checking GPU and CUDA...
python check_gpu.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: GPU check failed or not optimal
    echo The service will work but may be slower on CPU
    echo.
    pause
)

echo.
echo [2/4] Installing PyTorch with CUDA support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo.
echo [3/4] Installing other dependencies...
pip install -r requirements.txt

echo.
echo [4/4] Starting the AI service...
echo.
echo The model will download on first run (~6-7 GB)
echo Please wait, this may take several minutes...
echo.
echo API will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

python app.py
