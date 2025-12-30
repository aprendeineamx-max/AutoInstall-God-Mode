@echo off
title AutoInstall Agent Server
cd agent
if not exist "node_modules" (
    echo [Agente] Instalando dependencias por primera vez...
    call npm install
)
echo [Agente] Iniciando servidor...
node server.js
pause
