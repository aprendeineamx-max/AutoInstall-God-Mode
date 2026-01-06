@echo off
echo [AutoInstall] Checking for Microsoft Edge...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo [INFO] Microsoft Edge is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Microsoft Edge...
winget install --id Microsoft.Edge -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
