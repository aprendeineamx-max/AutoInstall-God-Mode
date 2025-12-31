const winston = require('winston');
const path = require('path');

// Configuración de Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Escribir todos los logs a archivo
        new winston.transports.File({ filename: path.join(__dirname, 'agent-error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, 'agent-combined.log') }),
        // Escribir a consola también
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ],
});

let io = null;

module.exports = {
    // Inicializar con la instancia de Socket.IO
    init: (socketIoInstance) => {
        io = socketIoInstance;
    },

    info: (message, meta = {}) => {
        logger.info(message, meta);
        if (io) io.emit('log', { timestamp: new Date(), level: 'info', message, meta });
    },

    error: (message, meta = {}) => {
        logger.error(message, meta);
        if (io) io.emit('log', { timestamp: new Date(), level: 'error', message, meta });
    },

    warn: (message, meta = {}) => {
        logger.warn(message, meta);
        if (io) io.emit('log', { timestamp: new Date(), level: 'warn', message, meta });
    }
};
