@echo off
setlocal

echo [Auto-Git-Auth] Iniciando configuracion de identidad...

REM 1. Check/Install GitHub CLI using Winget (Autopoiesis will handle this via SmartInstaller usually, but we force check here)
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo [Auto-Git-Auth] GitHub CLI no detectado. Instalando via Winget...
    winget install --id GitHub.cli -e --silent --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo [Auto-Git-Auth] Error instalando GitHub CLI. Intentando Chocolatey...
        choco install gh -y
    )
    REM Refresh environment
    call RefreshEnv.cmd >nul 2>nul
) else (
    echo [Auto-Git-Auth] GitHub CLI ya instalado.
)

REM 2. Configure Git Credential Helper to use GH CLI
echo [Auto-Git-Auth] Configurando 'gh' como helper de credenciales...
gh auth setup-git
git config --global credential.helper manager

REM 3. Attempt Login if Token Provided (Non-Interactive Mode)
if defined GITHUB_TOKEN (
    echo [Auto-Git-Auth] Limpiando sesion anterior...
    echo y | gh auth logout >nul 2>nul
    
    echo [Auto-Git-Auth] Token detectado. Iniciando sesion silenciosa...
    echo %GITHUB_TOKEN% | gh auth login --with-token
    
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo el inicio de sesion. Codigo: %errorlevel%
        echo [DEBUG] Verifique que el token no haya expirado.
    ) else (
        echo [Auto-Git-Auth] Sesion iniciada correctamente.
        gh auth setup-git
    )
) else (
    echo [Auto-Git-Auth] ADVERTENCIA: Variable GITHUB_TOKEN no definida.
    echo [Auto-Git-Auth] Se requiere intervencion manual una unica vez o definir GITHUB_TOKEN.
)

REM 4. Verify
echo [Auto-Git-Auth] Verificando estado...
gh auth status

echo [Auto-Git-Auth] Configuracion completada.
echo [Tip] Si VS Code sigue pidiendo acceso, reinicie el editor para que tome el nuevo 'credential.helper'.
