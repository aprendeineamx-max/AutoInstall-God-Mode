const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const profiler = require('./profiler');
const logger = require('./logger');

const STATE_FILE = path.join(__dirname, 'tools_state.json');

const MANIFEST_FILE = path.join(__dirname, 'universal_manifest.json');
let MANIFEST = {};

// Default Manifest for Autopoiesis (Self-Healing)
const DEFAULT_MANIFEST = {
    "docker": {
        "name": "Docker Desktop",
        "sources": { "winget": "Docker.DockerDesktop", "choco": "docker-desktop", "scoop": "docker" },
        "requirements": { "minRamGB": 4, "needsVirtualization": true, "needsHyperV": true }
    },
    "vscode": {
        "name": "Visual Studio Code",
        "sources": { "winget": "Microsoft.VisualStudioCode", "choco": "vscode", "scoop": "vscode" }
    },
    "nodejs": {
        "name": "Node.js (LTS)",
        "sources": { "winget": "OpenJS.NodeJS.LTS", "choco": "nodejs-lts", "scoop": "nodejs-lts" }
    },
    "git": {
        "name": "Git",
        "sources": { "winget": "Git.Git", "choco": "git", "scoop": "git" }
    },
    "chrome": {
        "name": "Google Chrome",
        "sources": { "winget": "Google.Chrome", "choco": "googlechrome", "scoop": "googlechrome" }
    }
};

try {
    if (!fs.existsSync(MANIFEST_FILE)) {
        logger.warn('Manifest universal no encontrado. Iniciando restauración autopoiética...');
        fs.writeFileSync(MANIFEST_FILE, JSON.stringify(DEFAULT_MANIFEST, null, 4));
        logger.info('Manifest universal restaurado correctamente.');
    }
    MANIFEST = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
} catch (e) {
    logger.error('Error crítico cargando/restaurando universal_manifest:', e);
    MANIFEST = DEFAULT_MANIFEST; // Fallback in memory
}

// Requisitos conocidos (legacy, will be superseded by manifest)
const REQUIREMENTS = {
    'docker': { minRamGB: 4, needsVirtualization: true, needsHyperV: true },
    'android-studio': { minRamGB: 8, minDiskGB: 10 }
};

const SmartInstaller = {
    // Memoria del sistema
    memory: {
        managers: {
            winget: { installed: false, status: 'unknown' },
            choco: { installed: false, status: 'unknown' },
            scoop: { installed: false, status: 'unknown' },
            npm: { installed: false, status: 'unknown' }
        }
    },

    loadMemory: () => {
        try {
            if (fs.existsSync(STATE_FILE)) {
                SmartInstaller.memory = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
                logger.info('Memoria de herramientas cargada:', SmartInstaller.memory);
            }
        } catch (e) {
            logger.error('Error cargando memoria:', e);
        }
    },

    saveMemory: () => {
        try {
            fs.writeFileSync(STATE_FILE, JSON.stringify(SmartInstaller.memory, null, 2));
        } catch (e) {
            logger.error('Error guardando memoria:', e);
        }
    },

    /**
     * Intenta instalar gestores faltantes (Autopoiesis)
     */
    provisionPackageManagers: async () => {
        logger.info('Iniciando aprovisionamiento autopoiético de herramientas...');

        // 1. Detectar estado actual
        await SmartInstaller.detectPackageManagers();

        // 2. Intentar instalar Chocolatey si falta y no está marcado como roto
        if (!SmartInstaller.memory.managers.choco.installed && SmartInstaller.memory.managers.choco.status !== 'broken') {
            logger.info('Detectado Chocolatey faltante. Intentando auto-instalación...');
            try {
                await SmartInstaller.installChocolatey();
                SmartInstaller.memory.managers.choco.installed = true;
                SmartInstaller.memory.managers.choco.status = 'healthy';
                logger.info('¡Chocolatey instalado y operativo!');
            } catch (e) {
                logger.error('Fallo al auto-instalar Chocolatey. Marcando como roto.', e);
                SmartInstaller.memory.managers.choco.status = 'broken';
            }
        }

        // 3. Intentar instalar Scoop si falta
        if (!SmartInstaller.memory.managers.scoop.installed && SmartInstaller.memory.managers.scoop.status !== 'broken') {
            logger.info('Detectado Scoop faltante. Intentando auto-instalación...');
            try {
                await SmartInstaller.installScoop();
                SmartInstaller.memory.managers.scoop.installed = true;
                SmartInstaller.memory.managers.scoop.status = 'healthy';
                logger.info('¡Scoop instalado y operativo!');
            } catch (e) {
                logger.error('Fallo al auto-instalar Scoop. Marcando como roto.', e);
                SmartInstaller.memory.managers.scoop.status = 'broken';
            }
        }

        SmartInstaller.saveMemory();
    },

    installChocolatey: () => {
        return new Promise((resolve, reject) => {
            // PowerShell command to install Chocolatey
            const cmd = `"%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"`;
            // We spawn a new shell to update the environment variables is tricky in node without a restart, 
            // but for now we trust choco is installed.
            exec(cmd, { shell: true }, (err, stdout, stderr) => {
                if (err) return reject(new Error(stderr || stdout));
                resolve(stdout);
            });
        });
    },

    installScoop: () => {
        return new Promise((resolve, reject) => {
            const cmd = `powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser; iwr -useb get.scoop.sh | iex"`;
            exec(cmd, { shell: true }, (err, stdout, stderr) => {
                if (err) return reject(new Error(stderr || stdout));
                resolve(stdout);
            });
        });
    },

    detectPackageManagers: async () => {
        const checkCommand = (cmd) => new Promise(resolve => {
            exec(cmd + ' --version', (err) => resolve(!err));
        });

        const updateStatus = async (key, cmd) => {
            const exists = await checkCommand(cmd);
            SmartInstaller.memory.managers[key].installed = exists;
            // Si existe y no estaba marcado como roto, asumimos saludable
            if (exists && SmartInstaller.memory.managers[key].status === 'unknown') {
                SmartInstaller.memory.managers[key].status = 'healthy';
            }
        };

        await Promise.all([
            updateStatus('winget', 'winget'),
            updateStatus('choco', 'choco'),
            updateStatus('scoop', 'scoop'),
            updateStatus('npm', 'npm')
        ]);

        SmartInstaller.saveMemory();
        return SmartInstaller.memory.managers;
    },

    checkRequirements: (packageId, capabilities) => {
        // Buscar requisitos en el manifest o en la lista legacy
        const manifestItem = MANIFEST[packageId];
        const reqs = (manifestItem && manifestItem.requirements) ? manifestItem.requirements : REQUIREMENTS[packageId];

        if (!reqs) return { allowed: true };

        if (reqs.minRamGB) {
            const totalRamGB = capabilities.memory.total / (1024 * 1024 * 1024);
            if (totalRamGB < reqs.minRamGB) {
                return { allowed: false, reason: `RAM insuficiente.Requerido: ${reqs.minRamGB} GB` };
            }
        }
        if (reqs.needsVirtualization && !capabilities.cpu.virtualization) {
            return { allowed: false, reason: 'Virtualización desactivada.' };
        }
        return { allowed: true };
    },

    /**
     * Resuelve el comando de instalación usando el catálogo universal
     */
    resolveInstallCommand: async (packageId, scriptPath) => {
        SmartInstaller.loadMemory();

        const capabilities = await profiler.getCapabilities();
        const preFlight = SmartInstaller.checkRequirements(packageId, capabilities);

        if (!preFlight.allowed) {
            throw new Error(`PRE - FLIGHT CHECK FAILED: ${preFlight.reason} `);
        }

        const managers = SmartInstaller.memory.managers;
        const metadata = MANIFEST[packageId];

        // Estrategia de Selección Universal
        let command = null;
        let method = 'script';

        if (metadata && metadata.sources) {
            // Prioridad 1: Winget (Nativo de MS)
            if (managers.winget.installed && managers.winget.status === 'healthy' && metadata.sources.winget) {
                method = 'winget';
                command = `winget install--id ${metadata.sources.winget} -e--silent--accept - package - agreements--accept - source - agreements`;
            }
            // Prioridad 2: Chocolatey (Muy robusto)
            else if (managers.choco.installed && managers.choco.status === 'healthy' && metadata.sources.choco) {
                method = 'choco';
                command = `choco install ${metadata.sources.choco} -y`;
            }
            // Prioridad 3: Scoop (Ligero)
            else if (managers.scoop.installed && managers.scoop.status === 'healthy' && metadata.sources.scoop) {
                method = 'scoop';
                command = `scoop install ${metadata.sources.scoop} `;
            }
        }

        // Fallback: Si no hay fuentes en manifest o fallaron los managers, usar script legacy
        if (!command) {
            logger.info(`[SmartResolver] No se encontraron fuentes gestionadas para ${packageId}. Usando script local.`);
            method = 'script';
            command = scriptPath;
        } else {
            logger.info(`[SmartResolver] Fuente seleccionada para ${packageId}: ${method} `);
        }

        return {
            method,
            command,
            managers: SmartInstaller.memory.managers
        };
    }
};

module.exports = SmartInstaller;
