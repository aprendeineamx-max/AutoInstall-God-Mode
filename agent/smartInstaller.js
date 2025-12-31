const { exec } = require('child_process');
const profiler = require('./profiler');
const logger = require('./logger');

// Mapa de requisitos conocidos para software crítico
const REQUIREMENTS = {
    'docker': {
        minRamGB: 4,
        needsVirtualization: true,
        needsHyperV: true
    },
    'android-studio': {
        minRamGB: 8,
        minDiskGB: 10
    },
    'visual-studio': {
        minDiskGB: 20
    }
};

const SmartInstaller = {
    /**
     * Verifica si el sistema cumple los requisitos para instalar un paquete
     * @param {string} packageId Identificador del paquete (ej: 'docker')
     * @param {Object} capabilities Objeto de capacidades del profiler
     * @returns {Object} { allowed: boolean, reason: string }
     */
    checkRequirements: (packageId, capabilities) => {
        const reqs = REQUIREMENTS[packageId];
        if (!reqs) return { allowed: true }; // Si no hay requisitos definidos, permitir.

        if (reqs.minRamGB) {
            const totalRamGB = capabilities.memory.total / (1024 * 1024 * 1024);
            if (totalRamGB < reqs.minRamGB) {
                return { allowed: false, reason: `RAM insuficiente. Requerido: ${reqs.minRamGB}GB, Disponible: ${totalRamGB.toFixed(1)}GB` };
            }
        }

        if (reqs.needsVirtualization) {
            if (!capabilities.cpu.virtualization) {
                return { allowed: false, reason: 'La virtualización (VT-x/AMD-V) está desactivada en BIOS.' };
            }
        }

        // TODO: Agregar más chequeos (Espacio en disco, OS version)
        return { allowed: true };
    },

    /**
     * Detecta qué gestores de paquetes están disponibles en el sistema
     */
    detectPackageManagers: async () => {
        const checkCommand = (cmd) => new Promise(resolve => {
            exec(cmd + ' --version', (err) => resolve(!err));
        });

        const [hasWinget, hasChoco, hasScoop, hasNpm] = await Promise.all([
            checkCommand('winget'),
            checkCommand('choco'),
            checkCommand('scoop'),
            checkCommand('npm')
        ]);

        return { winget: hasWinget, choco: hasChoco, scoop: hasScoop, npm: hasNpm };
    },

    /**
     * Resuelve el mejor comando de instalación
     */
    resolveInstallCommand: async (packageId, scriptPath) => {
        // 1. Obtener inteligenca del sistema
        const managers = await SmartInstaller.detectPackageManagers();
        const capabilities = await profiler.getCapabilities();

        // 2. Verificar requisitos "Kill Switch"
        const preFlight = SmartInstaller.checkRequirements(packageId, capabilities);
        if (!preFlight.allowed) {
            throw new Error(`PRE-FLIGHT CHECK FAILED: ${preFlight.reason}`);
        }

        logger.info(`SmartInstaller: Resolviendo estrategia para '${packageId}'...`, { managers });

        // Lógica de decisión (Ejemplo simplificado, expandir según catálogo)
        // Por ahora, si es un script local, priorizamos el script.
        // Pero idealmente, aquí diríamos: "Si no hay script, usa Winget".

        return {
            method: 'script',
            command: scriptPath, // Por ahora mantenemos compatibilidad con scripts legacy
            managersAvailable: managers
        };
    }
};

module.exports = SmartInstaller;
