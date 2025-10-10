@echo off
echo EyeRemote Installation
echo =====================
echo.

echo Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo =====================
echo Installation completed!
echo.
echo To run EyeRemote:
echo   1. Run: python eyeremote.py
echo   2. Or use: installers\run.bat
echo.
echo Make sure your webcam is connected and not used by other applications.
echo.
pause