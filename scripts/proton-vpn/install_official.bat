@echo off
echo [AutoInstall] Downloading Proton VPN from Official Site...
powershell -Command "Invoke-WebRequest -Uri 'https://protonvpn.com/download/ProtonVPN_Setup.exe' -OutFile 'installer.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Download failed. Opening download page...
    start https://protonvpn.com/download
    exit /b 1
)

echo [AutoInstall] Installing Proton VPN...
installer.exe /S
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    del installer.exe
    exit /b 1
)
del installer.exe
echo [SUCCESS] Installation completed.
