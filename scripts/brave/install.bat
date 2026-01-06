@echo off
echo [AutoInstall] Checking for Brave Browser...
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    echo [INFO] Brave Browser is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Brave Browser...
winget install --id Brave.Brave -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
