@echo off
REM Install PyTorch with CUDA support for Windows
REM Run this script if PyTorch cannot see your GPU

echo ===============================================
echo  Installing PyTorch with CUDA 11.8 Support
echo ===============================================
echo.

echo Uninstalling existing PyTorch (if any)...
pip uninstall -y torch torchvision torchaudio

echo.
echo Installing PyTorch with CUDA 11.8...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo.
echo ===============================================
echo  Installation Complete!
echo ===============================================
echo.
echo Run "python check_gpu.py" to verify installation
echo.
pause
