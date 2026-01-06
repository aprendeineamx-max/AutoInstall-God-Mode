@echo off
echo [AutoInstall] Checking for Chrome Beta...
if exist "C:\Program Files\Google\Chrome Beta\Application\chrome.exe" (
    echo [INFO] Chrome Beta is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Chrome Beta...
winget install --id Google.Chrome.Beta -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
