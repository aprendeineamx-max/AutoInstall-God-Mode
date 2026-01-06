@echo off
echo [AutoInstall] Checking for Firefox Beta...
if exist "C:\Program Files\Mozilla Firefox Beta\firefox.exe" (
    echo [INFO] Firefox Beta is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Firefox Beta...
winget install --id Mozilla.Firefox.Beta -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
