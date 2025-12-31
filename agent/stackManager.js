const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const smartInstaller = require('./smartInstaller'); // We reuse our smart installer!
const logger = require('./logger');
const profiler = require('./profiler');

const STACKS_DIR = path.join(__dirname, '..', 'stacks');

class StackManager {
    constructor() {
        if (!fs.existsSync(STACKS_DIR)) {
            fs.mkdirSync(STACKS_DIR);
        }
    }

    // 1. List Available Stacks
    listStacks() {
        try {
            const files = fs.readdirSync(STACKS_DIR).filter(f => f.endsWith('.ai-stack'));
            return files.map(file => {
                try {
                    const content = JSON.parse(fs.readFileSync(path.join(STACKS_DIR, file), 'utf8'));
                    return {
                        filename: file,
                        meta: content.meta,
                        valid: true
                    };
                } catch (e) {
                    return { filename: file, valid: false, error: e.message };
                }
            });
        } catch (error) {
            logger.error('Error listing stacks:', error);
            return [];
        }
    }

    // 2. Validate Hardware Requirements
    async checkRequirements(stack) {
        if (!stack.requirements) return { compatible: true };

        const specs = await profiler.getSystemSpecs();
        const errors = [];

        // Check RAM
        if (stack.requirements.minRamGB) {
            const totalRamGB = specs.memory.total / (1024 * 1024 * 1024);
            if (totalRamGB < stack.requirements.minRamGB) {
                errors.push(`Insufficient RAM. Required: ${stack.requirements.minRamGB}GB, Found: ${totalRamGB.toFixed(1)}GB`);
            }
        }

        // Check OS (Simple check)
        if (stack.requirements.os && process.platform !== stack.requirements.os) {
            errors.push(`OS Mismatch. Required: ${stack.requirements.os}, Found: ${process.platform}`);
        }

        return {
            compatible: errors.length === 0,
            errors
        };
    }

    // 3. The "Hydration" Process (Execute the Stack)
    async hydrateStack(filename) {
        logger.info(`🔮 Starting Hydration for stack: ${filename}`);
        const stackPath = path.join(STACKS_DIR, filename);

        if (!fs.existsSync(stackPath)) {
            throw new Error('Stack file not found');
        }

        const stack = JSON.parse(fs.readFileSync(stackPath, 'utf8'));

        // A. Validation
        const reqCheck = await this.checkRequirements(stack);
        if (!reqCheck.compatible) {
            throw new Error(`System Incompatible: ${reqCheck.errors.join(', ')}`);
        }

        const report = {
            packages: [],
            extensions: [],
            scripts: []
        };

        // B. Install Packages via SmartInstaller
        if (stack.packages) {
            logger.info('📦 Installing Core Packages...');
            for (const pkg of stack.packages) {
                const pkgId = typeof pkg === 'string' ? pkg : pkg.id;
                try {
                    logger.info(`Installing package: ${pkgId}`);
                    // Use our existing Smart Resolver logic!
                    await smartInstaller.installPackage(pkgId);
                    report.packages.push({ id: pkgId, status: 'installed' });
                } catch (e) {
                    logger.error(`Failed to install ${pkgId}:`, e);
                    report.packages.push({ id: pkgId, status: 'error', error: e.message });
                }
            }
        }

        // C. VS Code Extensions
        if (stack.extensions) {
            logger.info('🧩 Installing VS Code Extensions...');
            for (const ext of stack.extensions) {
                try {
                    await this.installVSExtension(ext);
                    report.extensions.push({ id: ext, status: 'installed' });
                } catch (e) {
                    report.extensions.push({ id: ext, status: 'error', error: e.message });
                }
            }
        }

        // D. Lifecycle Scripts (Post-Install)
        if (stack.lifecycle && stack.lifecycle.postInstall) {
            logger.info('⚙️ Running Post-Install Scripts...');
            try {
                await this.runScript(stack.lifecycle.postInstall);
                report.scripts.push({ name: 'postInstall', status: 'success' });
            } catch (e) {
                report.scripts.push({ name: 'postInstall', status: 'error', error: e.message });
            }
        }

        logger.info('✅ Hydration Complete');
        return report;
    }

    // Helper: VS Code Extensions
    installVSExtension(extId) {
        return new Promise((resolve, reject) => {
            // Check if 'code' is in path, otherwise full path might be needed. 
            // Assuming 'code' works if VS Code is installed.
            exec(`code --install-extension ${extId} --force`, (error, stdout, stderr) => {
                if (error) {
                    logger.warn(`VS Code Extension Error (${extId}): ${stderr}`);
                    reject(error);
                } else {
                    logger.info(`VS Code Extension Installed: ${extId}`);
                    resolve(stdout);
                }
            });
        });
    }

    // Helper: Run generic script
    runScript(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Script Fail: ${command}`, stderr);
                    reject(error);
                } else {
                    logger.info(`Script Output: ${stdout}`);
                    resolve(stdout);
                }
            });
        });
    }
}

module.exports = new StackManager();
