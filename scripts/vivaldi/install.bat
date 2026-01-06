@echo off
echo [AutoInstall] Checking for Vivaldi...
if exist "%LOCALAPPDATA%\Vivaldi\Application\vivaldi.exe" (
    echo [INFO] Vivaldi is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Vivaldi...
winget install --id Vivaldi.Vivaldi -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
