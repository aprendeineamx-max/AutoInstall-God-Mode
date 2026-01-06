@echo off
echo [AutoInstall] Checking for Proton Mail Bridge...
if exist "C:\Program Files\Proton\Bridge\ProtonMailBridge.exe" (
    echo [INFO] Proton Mail Bridge is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton Mail Bridge...
:: Try specific version v3.14.0 (example) or fallback
powershell -Command "try { $latest = Invoke-RestMethod -Uri 'https://api.github.com/repos/ProtonMail/proton-bridge/releases/latest'; Invoke-WebRequest -Uri $latest.assets[0].browser_download_url -OutFile 'installer.exe' } catch { exit 1 }"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Auto-download failed. Opening download page...
    start https://proton.me/mail/bridge
    exit /b 1
)

echo [AutoInstall] Installing Proton Mail Bridge...
installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
