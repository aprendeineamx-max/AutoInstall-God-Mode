@echo off
title SYSTEM NUKE - RESET
color 4f
echo ===================================================
echo      ADVERTENCIA: MODO DE LIMPIEZA PROFUNDA
echo ===================================================
echo.
echo Este script simula la eliminacion de herramientas instaladas.
echo En produccion, ejecutaria comandos como:
echo - winget uninstall --id Git.Git
echo - winget uninstall --id GitHub.cli
echo - winget uninstall --id Microsoft.VisualStudioCode
echo.
echo Presiona una tecla para continuar...
pause >nul

echo [1/3] Limpiando credenciales de Git...
cmdkey /delete:git:https://github.com
git config --global --unset user.name
git config --global --unset user.email

echo [2/3] Simulando desinstalacion de VS Code...
timeout /t 2 >nul

echo [3/3] Simulando desinstalacion de Node.js...
timeout /t 2 >nul

echo.
echo SISTEMA LIMPIO.
echo Por favor reinicia la PC.
pause
