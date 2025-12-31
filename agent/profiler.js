const si = require('systeminformation');
const logger = require('./logger');

module.exports = {
    getCapabilities: async () => {
        try {
            logger.info('Iniciando escaneo hardware profundo...');
            const [cpu, mem, osInfo, graphics, disk, docker] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.graphics(),
                si.fsSize(),
                si.dockerInfo().catch(() => null) // Docker might fail if not installed
            ]);

            const primaryDisk = disk.find(d => d.mount === 'C:') || disk[0];

            return {
                timestamp: new Date(),
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    cores: cpu.cores,
                    physicalCores: cpu.physicalCores,
                    speed: cpu.speed,
                    virtualization: cpu.virtualization // Important!
                },
                memory: {
                    total: mem.total,
                    free: mem.free,
                    used: mem.used,
                    active: mem.active
                },
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    arch: osInfo.arch,
                    hostname: osInfo.hostname
                },
                gpu: graphics.controllers.map(g => ({
                    model: g.model,
                    vram: g.vram,
                    driver: g.driverVersion
                })),
                storage: {
                    total: primaryDisk ? primaryDisk.size : 0,
                    used: primaryDisk ? primaryDisk.used : 0,
                    percent: primaryDisk ? primaryDisk.use : 0
                },
                features: {
                    docker: !!docker,
                    hyperv: cpu.virtualization
                }
            };
        } catch (e) {
            logger.error('Error en system profile:', e);
            return { error: e.message };
        }
    }
};
