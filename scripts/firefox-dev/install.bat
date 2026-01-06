@echo off
echo [AutoInstall] Checking for Firefox Developer Edition...
if exist "C:\Program Files\Firefox Developer Edition\firefox.exe" (
    echo [INFO] Firefox Developer Edition is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Firefox Developer Edition...
winget install --id Mozilla.Firefox.DeveloperEdition -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
