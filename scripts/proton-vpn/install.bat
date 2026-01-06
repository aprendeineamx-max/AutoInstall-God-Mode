@echo off
echo [AutoInstall] Checking for Proton VPN...
if exist "C:\Program Files\Proton\VPN\ProtonVPN.exe" (
    echo [INFO] Proton VPN is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton VPN...
powershell -Command "Invoke-WebRequest -Uri 'https://protonvpn.com/download/ProtonVPN_Setup.exe' -OutFile 'installer.exe'"

echo [AutoInstall] Installing Proton VPN...
start /wait installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
