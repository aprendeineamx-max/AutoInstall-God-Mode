@echo off
echo [AutoInstall] Checking for Proton VPN...
if exist "C:\Program Files\Proton\VPN\ProtonVPN.exe" (
    echo [INFO] Proton VPN is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton VPN...
:: Try specific version v4.3.4 which is known to exist
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/ProtonVPN/win-app/releases/download/v4.3.5/ProtonVPN_v4.3.5_x64.exe' -OutFile 'installer.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Download failed. Opening download page...
    start https://protonvpn.com/download
    exit /b 1
)

echo [AutoInstall] Installing Proton VPN...
installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
