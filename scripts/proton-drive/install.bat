@echo off
echo [AutoInstall] Checking for Proton Drive...
if exist "%LOCALAPPDATA%\ProtonDrive\ProtonDrive.exe" (
    echo [INFO] Proton Drive is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton Drive...
powershell -Command "Invoke-WebRequest -Uri 'https://proton.me/download/ProtonDrive-Setup.exe' -OutFile 'installer.exe'"

echo [AutoInstall] Installing Proton Drive...
start /wait installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
