@echo off
echo [AutoInstall] Checking for Mozilla Firefox...
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    echo [INFO] Firefox is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Mozilla Firefox...
winget install --id Mozilla.Firefox -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
