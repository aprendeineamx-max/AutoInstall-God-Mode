@echo off
echo [AutoInstall] Checking for Firefox Beta...
if exist "C:\Program Files\Mozilla Firefox Beta\firefox.exe" (
    echo [INFO] Firefox Beta is already installed.
    exit /b 0
)

echo [AutoInstall] Downloading Firefox Beta...
powershell -Command "Invoke-WebRequest -Uri 'https://download.mozilla.org/?product=firefox-beta-latest-ssl&os=win64&lang=en-US' -OutFile 'installer.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Download failed. Opening download page...
    start https://www.mozilla.org/firefox/channel/desktop/
    exit /b 1
)

echo [AutoInstall] Installing Firefox Beta...
installer.exe /S
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed.
    del installer.exe
    exit /b 1
)
del installer.exe
echo [SUCCESS] Installation completed.
