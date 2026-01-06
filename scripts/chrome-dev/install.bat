@echo off
echo [AutoInstall] Checking for Chrome Dev...
winget list -e --id Google.Chrome.Dev >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Chrome Dev is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Chrome Dev...
winget install --id Google.Chrome.Dev -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
