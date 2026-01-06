@echo off
echo [AutoInstall] Downloading Proton VPN from GitHub...
:: Try specific version v4.3.4 which is known to exist
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/ProtonVPN/win-app/releases/download/v4.3.5/ProtonVPN_v4.3.5_x64.exe' -OutFile 'installer.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] GitHub Download failed.
    exit /b 1
)

echo [AutoInstall] Installing Proton VPN from GitHub...
installer.exe /S
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    del installer.exe
    exit /b 1
)
del installer.exe
echo [SUCCESS] Installation completed.
