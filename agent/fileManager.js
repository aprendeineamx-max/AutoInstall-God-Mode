const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const FileManager = {
    /**
     * Lista el contenido de un directorio
     */
    listFiles: async (dirPath) => {
        try {
            // Default to current directory if not specified
            const targetPath = dirPath ? path.resolve(dirPath) : process.cwd();

            logger.info(`[FileManager] Listando directorio: ${targetPath}`);

            if (!fs.existsSync(targetPath)) {
                throw new Error(`Directorio no existe: ${targetPath}`);
            }

            const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });

            return entries.map(entry => ({
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : 'file',
                path: path.join(targetPath, entry.name),
                size: entry.isFile() ? fs.statSync(path.join(targetPath, entry.name)).size : 0
            }));
        } catch (error) {
            logger.error(`[FileManager] Error listando archivos: ${error.message}`);
            throw error;
        }
    },

    /**
     * Lee el contenido de un archivo de texto
     */
    readFile: async (filePath) => {
        try {
            logger.info(`[FileManager] Leyendo archivo: ${filePath}`);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no existe: ${filePath}`);
            }

            // Limit check: Don't read huge files
            const stats = fs.statSync(filePath);
            if (stats.size > 1024 * 1024 * 5) { // 5MB limit
                throw new Error('Archivo demasiado grande para edición remota (>5MB)');
            }

            const content = await fs.promises.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            logger.error(`[FileManager] Error leyendo archivo: ${error.message}`);
            throw error;
        }
    },

    /**
     * Guarda contenido en un archivo (Sobreescribe)
     */
    saveFile: async (filePath, content) => {
        try {
            logger.info(`[FileManager] Guardando archivo: ${filePath}`);
            await fs.promises.writeFile(filePath, content, 'utf8');
            return true;
        } catch (error) {
            logger.error(`[FileManager] Error guardando archivo: ${error.message}`);
            throw error;
        }
    }
};

module.exports = FileManager;
