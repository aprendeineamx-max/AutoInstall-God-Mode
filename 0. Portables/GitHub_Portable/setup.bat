@echo off
setlocal EnableDelayedExpansion
title AutoInstall Entorno GitHub

echo ===================================================
echo      INICIANDO INSTALACION DEL ECOSISTEMA GITHUB
echo ===================================================
echo.

:: 1. Cargar Credenciales
if exist "credentials.bat" (
    call credentials.bat
) else (
    echo [ERROR] No se encontro el archivo credential.bat.
    echo Por favor asegurese de que el archivo exista en la misma carpeta.
    pause
    exit /b 1
)

:: 2. Instalar Software con Winget
echo [1/5] Instalando Git...
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements

echo [2/5] Instalando GitHub CLI...
winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements

echo [3/5] Instalando GitHub Desktop...
winget install --id GitHub.GitHubDesktop -e --source winget --accept-package-agreements --accept-source-agreements

echo [4/5] Instalando Visual Studio Code...
winget install --id Microsoft.VisualStudioCode -e --source winget --accept-package-agreements --accept-source-agreements

:: Recargar variables de entorno para usar los nuevos comandos
call refreshenv 2>nul
:: Si refreshenv no existe (chocolatey), intentamos continuar. 
:: Agregamos manualmente las rutas estandar al PATH de la sesion actual
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

echo.
echo ===================================================
echo      CONFIGURANDO ENTORNO
echo ===================================================
echo.

:: 3. Configurar Git Global
echo [Configuracion Git] Estableciendo usuario y correo...
git config --global user.name %GIT_USER_NAME%
git config --global user.email %GIT_USER_EMAIL%

:: Configurar credencial helper para que guarde las claves en Windows
git config --global credential.helper manager

echo [Configuracion Git] Usuario configurado:
git config --global user.name
git config --global user.email

:: 4. Autenticar GitHub CLI
echo.
echo [Configuracion GitHub CLI] Autenticando...

:: Usamos el token para autenticar sin interactividad
:: El comando lee el token desde la entrada estandar o variable
echo %GITHUB_TOKEN% | gh auth login --with-token

if %ERRORLEVEL% EQU 0 (
    echo [EXITO] GitHub CLI autenticado correctamente.
    echo Configurando protocolo git para https...
    gh config set git_protocol https
) else (
    echo [ERROR] Fallo la autenticacion de GitHub CLI. Verifique su token.
)

echo.
echo ===================================================
echo      INSTALACION COMPLETA
echo ===================================================
echo.
echo Todo listo. Puedes cerrar esta ventana.
pause
