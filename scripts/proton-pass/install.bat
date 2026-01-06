@echo off
echo [AutoInstall] Checking for Proton Pass...
if exist "%LOCALAPPDATA%\ProtonPass\ProtonPass.exe" (
    echo [INFO] Proton Pass is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Proton Pass...
powershell -Command "Invoke-WebRequest -Uri 'https://proton.me/download/ProtonPass-Setup.exe' -OutFile 'installer.exe'"

echo [AutoInstall] Installing Proton Pass...
start /wait installer.exe /S
del installer.exe

echo [SUCCESS] Installation completed.
