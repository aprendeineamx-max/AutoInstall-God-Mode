@echo off
title AutoInstall - Node.js
echo.
echo [AutoInstall] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js ya esta instalado.
    node --version
    goto :EOF
)

echo [INFO] Instalando Node.js (LTS)...
winget install -e --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements

echo [INFO] Actualizando PATH...
call refreshenv 2>nul
set "PATH=%PATH%;C:\Program Files\nodejs"
