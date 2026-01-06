@echo off
echo [AutoInstall] Checking for Proton Mail Bridge...
if exist "C:\Program Files\Proton\Bridge\ProtonMailBridge.exe" (
    echo [INFO] Proton Mail Bridge is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton Mail Bridge...
powershell -Command "Invoke-WebRequest -Uri 'https://proton.me/download/Bridge-Installer.exe' -OutFile 'installer.exe'"

echo [AutoInstall] Installing Proton Mail Bridge...
start /wait installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
