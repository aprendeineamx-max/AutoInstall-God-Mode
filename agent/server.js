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
const profiler = require('./profiler');
const smartInstaller = require('./smartInstaller');
const fileManager = require('./fileManager');
const stackManager = require('./stackManager'); // Import StackManager

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permitir acceso desde el frontend
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Inicializar Logger
logger.init(io);

// Inicializar Smart Installer (Autopoiesis)
smartInstaller.loadMemory();
// No bloqueamos el arranque, lo hacemos en background
smartInstaller.provisionPackageManagers().then(() => {
    logger.info("Ciclo de aprovisionamiento inicial completado.");
});

// Servir archivos estáticos del frontend (Build de producción)
app.use(express.static(path.join(__dirname, '../web-interface/dist')));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SECURITY MIDDLEWARE: Basic Auth
const AGENT_KEY = process.env.AGENT_KEY || 'godmode'; // Default dev key
const authMiddleware = (req, res, next) => {
    // Allow options for CORS pre-flight
    if (req.method === 'OPTIONS') return next();

    // Allow status endpoint for health checks (optional, but good for watchers)
    if (req.path === '/status' && req.method === 'GET') return next();

    const clientKey = req.headers['x-agent-key'] || req.query.key;

    if (clientKey === AGENT_KEY) {
        next();
    } else {
        logger.warn(`Intento de acceso no autorizado desde ${req.ip}`);
        res.status(401).json({ error: 'Unauthorized: Invalid Agent Key' });
    }
};

app.use(authMiddleware);

// Socket.IO Auth (Simple handshake)
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token === AGENT_KEY) {
        next();
    } else {
        next(new Error("Unauthorized"));
    }
});

io.on('connection', (socket) => {
    logger.info(`Nuevo cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
    });
});

// Path a la carpeta de scripts
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

// --- NEURAL STACKS API ---

// 1. List Stacks
app.get('/api/stacks', (req, res) => {
    try {
        const stacks = stackManager.listStacks();
        res.json(stacks);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Hydrate Stack
app.post('/api/stacks/hydrate', async (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename required' });

    try {
        const report = await stackManager.hydrateStack(filename);
        res.json({ success: true, report });
    } catch (e) {
        logger.error('Hydration Failed', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// --- Endpoints ---

// 1. Estado del Servidor
// Endpoint de Capacidades (Deep Diagnostics)
app.get('/capabilities', async (req, res) => {
    logger.info("Solicitud de capacidades del sistema");
    const caps = await profiler.getCapabilities();
    res.json(caps);
});

app.get('/status', (req, res) => {
    res.json({
        online: true,
        hostname: os.hostname(),
        platform: process.platform,
        ip: ip.address()
    });
});

// 2. Listar Scripts Disponibles
// 2. Listar Scripts Disponibles (Smart Detection)
app.get('/scripts', async (req, res) => {
    try {
        const modules = fs.readdirSync(SCRIPTS_DIR).filter(file => {
            return fs.statSync(path.join(SCRIPTS_DIR, file)).isDirectory();
        });

        const scriptList = await Promise.all(modules.map(async (mod) => {
            const modPath = path.join(SCRIPTS_DIR, mod);
            const manifestPath = path.join(modPath, 'manifest.json');
            const installScript = fs.existsSync(path.join(modPath, 'install.bat')) ? 'install.bat' :
                (fs.existsSync(path.join(modPath, 'install.ps1')) ? 'install.ps1' : null);

            let scriptData = {
                id: mod,
                name: mod.charAt(0).toUpperCase() + mod.slice(1),
                description: "Automated installation package.",
                version: "1.0.0", // Placeholder
                hasInstaller: !!installScript,
                status: 'unknown',
                manifest: null
            };

            // Smart Detection via Manifest
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    scriptData.name = manifest.name || scriptData.name;
                    scriptData.description = manifest.description || scriptData.description;
                    scriptData.manifest = manifest;

                    if (manifest.check && manifest.check.command) {
                        // Run check with extended PATH
                        const extendedPath = [
                            process.env.PATH,
                            'C:\\Program Files\\Git\\cmd',
                            'C:\\Program Files\\nodejs',
                            'C:\\Python312',
                            'C:\\Python311',
                            'C:\\Python310',
                            'C:\\Program Files\\GitHub CLI',
                            process.env.LOCALAPPDATA + '\\Programs\\Python\\Python312',
                            process.env.LOCALAPPDATA + '\\Programs\\Python\\Python311'
                        ].join(';');

                        try {
                            await new Promise((resolve, reject) => {
                                exec(manifest.check.command, {
                                    timeout: 5000,
                                    env: { ...process.env, PATH: extendedPath }
                                }, (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            });
                            scriptData.status = 'installed';
                        } catch (e) {
                            scriptData.status = 'missing';
                        }
                    } else {
                        scriptData.status = 'missing'; // Fallback
                    }
                } catch (e) {
                    logger.error(`Error reading manifest for ${mod}:`, e);
                }
            } else {
                // Legacy Fallback: Assume missing if we can't check, or 'unknown'
                scriptData.status = 'missing';
            }

            return scriptData;
        }));

        res.json(scriptList);
    } catch (error) {
        logger.error("Error leyendo scripts:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2a. Open Location Endpoint
app.post('/open-location', async (req, res) => {
    const { scriptId } = req.body;
    const manifestPath = path.join(SCRIPTS_DIR, scriptId, 'manifest.json');

    if (!fs.existsSync(manifestPath)) return res.status(404).json({ error: "Manifest not found" });

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.locate && manifest.locate.command) {
            exec(manifest.locate.command, async (err, stdout) => {
                if (!err && stdout.trim()) {
                    // Open explorer and select file
                    const fileLoc = stdout.split('\n')[0].trim();
                    exec(`explorer /select,"${fileLoc}"`);
                    res.json({ success: true });
                } else {
                    res.status(404).json({ error: "Location not found" });
                }
            });
        } else {
            res.status(400).json({ error: "Locate capability not defined" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2b. Uninstall Endpoint
app.post('/uninstall', (req, res) => {
    const { scriptId } = req.body;
    const manifestPath = path.join(SCRIPTS_DIR, scriptId, 'manifest.json');

    if (!fs.existsSync(manifestPath)) return res.status(404).json({ error: "Manifest not found" });

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.uninstall && manifest.uninstall.command) {
            // Spawn detached to allow persistence
            const child = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/c', manifest.uninstall.command + ' & pause'], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            res.json({ success: true, message: "Uninstallation started" });
        } else {
            res.status(400).json({ error: "Uninstall capability not defined" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Ejecutar Script (Smart Install)
app.post('/execute', async (req, res) => {
    const { scriptId, envVars } = req.body;

    // Resolve script path (bat or ps1)
    const modPath = path.join(SCRIPTS_DIR, scriptId);
    let scriptPathAbs = path.join(modPath, 'install.bat');
    let extension = '.bat';

    if (!fs.existsSync(scriptPathAbs)) {
        scriptPathAbs = path.join(modPath, 'install.ps1');
        extension = '.ps1';
    }

    if (!fs.existsSync(scriptPathAbs)) {
        return res.status(404).json({ error: `Installer not found for ${scriptId}` });
    }

    // Create a temporary wrapper script
    const wrapperName = `wrapper_${Date.now()}.bat`;
    const wrapperPath = path.join(os.tmpdir(), wrapperName);

    let wrapperContent = '@echo off\n';

    // Inyectar vars (Sanitized)
    if (envVars) {
        for (const [key, val] of Object.entries(envVars)) {
            // Simple sanitization: 
            // 1. Keys must be alphanumeric/underscore
            // 2. Values: Escape double quotes to prevent breaking out of set "x=y"
            if (!/^[a-zA-Z0-9_]+$/.test(key)) {
                logger.warn(`Skipping invalid env var key: ${key}`);
                continue;
            }

            // Escape " with "" (standard batch escaping inside quotes is weird, but usually ^ or "" works depending on context)
            // Safer: Just strip risky characters or minimal escape. 
            // Batch variable assignment set "VAR=VALUE" handles spaces well, but " inside VALUE breaks it.
            const safeVal = String(val).replace(/"/g, '""');

            wrapperContent += `set "${key}=${safeVal}"\n`;
        }
    }

    wrapperContent += `cd /d "${path.dirname(scriptPathAbs)}"\n`;

    if (extension === '.ps1') {
        wrapperContent += `powershell -ExecutionPolicy Bypass -File "${path.basename(scriptPathAbs)}"\n`;
    } else {
        wrapperContent += `call "${path.basename(scriptPathAbs)}"\n`;
    }

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

// 4. Endpoint "Smart Resolver" (Dry Run)
app.post('/resolve', async (req, res) => {
    const { scriptId } = req.body;
    const scriptPath = path.join(__dirname, '..', 'scripts', scriptId, 'install.bat');
    try {
        const diagnosis = await smartInstaller.resolveInstallCommand(scriptId, scriptPath);
        res.json(diagnosis);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5. File System API (God Mode)
app.get('/fs/list', async (req, res) => {
    try {
        const dirPath = req.query.path || process.cwd();
        const files = await fileManager.listFiles(dirPath);
        res.json({ path: dirPath, entries: files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/fs/read', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) throw new Error('Path required');
        const content = await fileManager.readFile(filePath);
        res.json({ path: filePath, content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/fs/write', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        if (!filePath || content === undefined) throw new Error('Path and content required');
        await fileManager.saveFile(filePath, content);
        res.json({ success: true, path: filePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const os = require('os');

// Start Server
const PORT_NUM = process.env.PORT || PORT;
server.listen(PORT_NUM, () => {
    logger.info(`Agente escuchando en puerto ${PORT_NUM}`);
    logger.info(`=========================================`);
    logger.info(`   AGENTE DE INSTALACION ACTIVO (Con Logs en Vivo)`);
    logger.info(`=========================================`);
    logger.info(`Accede a la interfaz web localmente o via:`);
    logger.info(`http://${ip.address()}:${PORT}`);
    logger.info(`=========================================`);
});
