@echo off
title AutoInstall Web Interface
cd web-interface
if not exist "node_modules" (
    echo [Web] Instalando dependencias por primera vez...
    call npm install
)
echo [Web] Iniciando servidor de desarrollo...
echo Accede a: http://localhost:5173
echo Desde tu movil: http://<TU_IP_LOCAL>:5173
call npm run dev -- --host
pause
