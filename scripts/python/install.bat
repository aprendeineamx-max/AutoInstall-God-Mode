@echo off
title AutoInstall - Python
echo.
echo [AutoInstall] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python ya esta instalado.
    python --version
    goto :EOF
)

echo [INFO] Instalando Python 3...
winget install -e --id Python.Python.3.11 --source winget --accept-package-agreements --accept-source-agreements

echo [INFO] Actualizando PATH...
call refreshenv 2>nul
:: Asumimos ruta por defecto de Python instalador oficial
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python311"
