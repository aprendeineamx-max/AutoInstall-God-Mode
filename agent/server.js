const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const http = require('http');
const { Server } = require("socket.io");
const logger = require('./logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permitir acceso desde el frontend
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Inicializar Logger con Websockets
logger.init(io);

// Middleware
app.use(cors());
app.use(bodyParser.json());

io.on('connection', (socket) => {
    logger.info(`Nuevo cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
    });
});

// Path a la carpeta de scripts
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

// --- Endpoints ---

// 1. Estado del Servidor
app.get('/status', (req, res) => {
    res.json({
        online: true,
        hostname: os.hostname(),
        platform: process.platform,
        ip: ip.address()
    });
});

// 2. Listar Scripts Disponibles
app.get('/scripts', (req, res) => {
    // Escanea recursivamente la carpeta scripts
    try {
        const modules = fs.readdirSync(SCRIPTS_DIR).filter(file => {
            return fs.statSync(path.join(SCRIPTS_DIR, file)).isDirectory();
        });

        const scriptList = modules.map(mod => {
            // Buscamos si existe install.bat
            const modPath = path.join(SCRIPTS_DIR, mod);
            const files = fs.readdirSync(modPath);
            const installScript = files.find(f => f.toLowerCase() === 'install.bat' || f.toLowerCase() === 'install.ps1');

            return {
                id: mod,
                name: mod.charAt(0).toUpperCase() + mod.slice(1), // Capitalize
                hasInstaller: !!installScript,
                path: installScript ? path.join('scripts', mod, installScript) : null
            };
        });

        res.json(scriptList);
    } catch (error) {
        logger.error("Error leyendo scripts:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Ejecutar Script
app.post('/execute', (req, res) => {
    const { scriptId, envVars } = req.body;

    if (!scriptId) {
        return res.status(400).json({ error: "Falta scriptId" });
    }

    const scriptPathAbs = path.join(SCRIPTS_DIR, scriptId, 'install.bat');

    if (!fs.existsSync(scriptPathAbs)) {
        return res.status(404).json({ error: "Script no encontrado" });
    }

    logger.info(`[EXEC] Solicitud de ejecucion: ${scriptId}`);

    // Crear un entorno personalizado combinando el actual con las variables recibidas
    const customEnv = { ...process.env, ...envVars };

    // Ejecutar el script
    // Usamos spawn para "disparar y olvidar" o streaming, pero para simpleza aqui ejecutaremos
    // abriendo una nueva ventana de consola para que el usuario vea el progreso.
    // "start cmd /c ..." abre ventana nueva.

    // Preparar comando para inyectar variables (un poco hacky en batch, mejor pasarlas al environment del proceso)
    // Pero 'start' lanza un proceso separado.
    // La estrategia mas robusta para este caso de uso "Visual" es escribir un wrapper temporal.

    const wrapperPath = path.join(__dirname, 'temp_wrapper.bat');
    let wrapperContent = '@echo off\n';

    // Inyectar vars
    if (envVars) {
        for (const [key, val] of Object.entries(envVars)) {
            wrapperContent += `set "${key}=${val}"\n`;
        }
    }

    wrapperContent += `cd /d "${path.dirname(scriptPathAbs)}"\n`;
    wrapperContent += `call "${path.basename(scriptPathAbs)}"\n`;
    wrapperContent += 'pause\n'; // Pausa al final para ver resultado
    wrapperContent += 'exit\n'; // Cerrar ventana

    fs.writeFileSync(wrapperPath, wrapperContent);

    // Ejecutar el wrapper en ventana nueva
    const child = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/c', wrapperPath], {
        detached: true,
        stdio: 'ignore'
    });
    child.unref();

    res.json({ success: true, message: "Instalacion iniciada en ventana emergente" });
});

const os = require('os');

server.listen(PORT, () => {
    logger.info(`=========================================`);
    logger.info(`   AGENTE DE INSTALACION ACTIVO (Con Logs en Vivo)`);
    logger.info(`=========================================`);
    logger.info(`Accede a la interfaz web localmente o via:`);
    logger.info(`http://${ip.address()}:${PORT}`);
    logger.info(`=========================================`);
});
