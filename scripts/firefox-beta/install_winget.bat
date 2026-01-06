@echo off
echo [AutoInstall] Installing Firefox Beta via Winget...
winget install --id Mozilla.Firefox.Beta -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Winget Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
