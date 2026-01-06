@echo off
echo [AutoInstall] Checking for Google Chrome...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo [INFO] Google Chrome is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Google Chrome...
winget install --id Google.Chrome -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
