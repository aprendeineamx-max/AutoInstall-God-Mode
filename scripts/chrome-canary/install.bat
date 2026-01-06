@echo off
echo [AutoInstall] Checking for Chrome Canary...
if exist "%LOCALAPPDATA%\Google\Chrome SxS\Application\chrome.exe" (
    echo [INFO] Chrome Canary is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Chrome Canary...
winget install --id Google.Chrome.Canary -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
