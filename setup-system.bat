@echo off
title AutoInstall System - Maestro
echo ===================================================
echo      SISTEMA DE AUTO INSTALACION Y AGENTE
echo ===================================================
echo.

:: 1. Instalar Node.js (Requisito del Agente)
call scripts\nodejs\install.bat

:: 2. Instalar Python (Utilidad opcional pero recomendada)
call scripts\python\install.bat

:: 3. Instalar Dependencias del Agente (Si existe el package.json)
if exist "agent\package.json" (
    echo.
    echo [Agente] Instalando dependencias del servidor...
    cd agent
    call npm install
    cd ..
)

echo.
echo ===================================================
echo      SISTEMA LISTO
echo ===================================================
echo.
echo Ejecuta 'start-agent.bat' para iniciar el servidor (Proximamente)
pause
