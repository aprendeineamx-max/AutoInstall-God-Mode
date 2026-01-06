@echo off
echo [AutoInstall] Checking for Firefox Nightly...
if exist "C:\Program Files\Firefox Nightly\firefox.exe" (
    echo [INFO] Firefox Nightly is already installed.
    exit /b 0
)

echo [AutoInstall] Installing Firefox Nightly...
winget install --id Mozilla.Firefox.Nightly -e --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    exit /b 1
)
echo [SUCCESS] Installation completed.
