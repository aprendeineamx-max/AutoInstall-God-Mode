@echo off
echo [AutoInstall] Checking for Firefox ESR...
winget list -e --id Mozilla.Firefox.ESR >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Firefox ESR is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Firefox ESR...
winget install --id Mozilla.Firefox.ESR -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
