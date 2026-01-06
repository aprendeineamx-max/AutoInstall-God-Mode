# Reporte de Auditoría de Código - AutoInstall God Mode
**Fecha:** 2026-01-06
**Status:** Completado (Fase 1)

Este documento registra deuda técnica, bugs potenciales, vulnerabilidades de seguridad y mejoras arquitectónicas detectadas durante la auditoría del sistema.

## 1. Backend (Agent - Node.js)

### [CRITICAL] Ejecución de Código Arbitrario
- **Archivo:** `agent/server.js` (Endpoint `/execute`)
- **Problema:** La ruta `scriptPathAbs` no está definida en el ámbito del endpoint antes de ser usada. Esto provocará un crash inmediato (ReferenceError) al intentar ejecutar cualquier script.
- **Impacto:** La funcionalidad principal de instalación está rota.

### [CRITICAL] Ausencia de Autenticación
- **Archivo:** `agent/server.js`
- **Problema:** La API REST y WebSocket no implementan ningún mecanismo de autenticación (Token, API Key, Basic Auth).
- **Impacto:** Cualquier dispositivo en la red local puede tomar control total del host, ejecutar comandos y leer archivos confidenciales.

### [HIGH] Inyección de Comandos (Env Vars)
- **Archivo:** `agent/server.js`
- **Problema:** La inyección de variables de entorno en el wrapper `.bat` (`set "${key}=${val}"`) no sanitiza las entradas.
- **Impacto:** Un usuario malintencionado (o una entrada errónea) podría inyectar comandos batch adicionales.

### [HIGH] Path Traversal en Sistema de Archivos
- **Archivo:** `agent/fileManager.js`
- **Problema:** Aunque `path.resolve` se usa, no se valida que el path resultante esté dentro de un directorio permitido (Sandbox).
- **Impacto:** Acceso de lectura/escritura a archivos críticos del sistema (ej. `C:\Windows\System32`, claves SSH).

## 2. Frontend (Web Interface - React)

### [MEDIUM] URLs Hardcodeadas
- **Archivo:** `App.jsx`, `FileExplorer.jsx`
- **Problema:** `const AGENT_API = 'http://localhost:3000';` está fijo en el código.
- **Impacto:** La interfaz web no funcionará si se accede desde otro dispositivo (móvil, laptop remota) ya que intentará conectarse al localhost del cliente, no del servidor.

### [LOW] Validación de Props Faltante
- **Archivo:** `FileExplorer.jsx`
- **Problema:** Se desactivó el linter de props (`eslint-disable react/prop-types`).
- **Impacto:** Menor mantenibilidad y dificultad para detectar bugs de tipos de datos.

## 3. Scripts y Sistema

### [MEDIUM] Manejo de Errores en Batch
- **Archivo:** `scripts/nodejs/install.bat` (y otros)
- **Problema:** Comandos como `winget install` no verifican `%ERRORLEVEL%`. El script continúa asumiendo éxito aunque falle la instalación.
- **Impacto:** Falsos positivos en la instalación; el agente reportará éxito cuando la herramienta no se instaló.

### [LOW] Dependencia Implícita de Chocolatey
- **Archivo:** `scripts/nodejs/install.bat`
- **Problema:** Uso de `call refreshenv`, un helper exclusivo de Chocolatey.
- **Impacto:** Si Chocolatey no está instalado, este comando fallará silenciosamente o generará ruido en los logs.

## Resumen de Acciones Recomendadas
1. **Prioridad Inmediata:** Corregir el bug de `scriptPathAbs` en `server.js`.
2. **Seguridad:** Implementar un middleware de autenticación simple (API Key en header).
3. **Robustez:** Agregar validación de errores en todos los scripts `.bat`.
4. **Configuración:** Mover `AGENT_API` a una variable dinámica basada en `window.location`.
