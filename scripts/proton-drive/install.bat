@echo off
echo [AutoInstall] Checking for Proton Drive...
if exist "%LOCALAPPDATA%\ProtonDrive\ProtonDrive.exe" (
    echo [INFO] Proton Drive is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton Drive...
powershell -Command "Invoke-WebRequest -Uri 'https://proton.me/download/ProtonDrive-Setup.exe' -OutFile 'installer.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Auto-download failed. Opening download page...
    start https://proton.me/drive/download
    exit /b 1
)

echo [AutoInstall] Installing Proton Drive...
installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
