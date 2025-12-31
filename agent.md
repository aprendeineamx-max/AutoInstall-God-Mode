# AGENT PROTOCOL: AutoInstall System "God Mode"
> **UBICACIÓN CRÍTICA**: Este archivo debe ser consultado al inicio de cada interacción.

## 1. Filosofía del Proyecto: "Best in Industry"
No estamos haciendo un script batch; estamos construyendo el **Sistema Operativo para Desarrolladores**.
- **Ambición Desmedida**: No te conformes con "funciona". Busca "impresiona".
- **Robustez Extrema (Autopoiesis)**: El sistema debe resistir errores, bloqueos y fallos de red. Debe curarse a sí mismo.
- **Experiencia Premium**: La UI debe sentirse como software de $10,000. Animaciones fluidas, feedback inmediato, modo oscuro perfecto.

## 2. Reglas de Oro (Prime Directives)
1.  **Logging es Vida (Observabilidad)**: Nada ocurre en silencio. Logs estructurados vía WebSockets. El usuario debe ver la "Matrix".
2.  **Abstracción Modular**: No escribas código repetitivo. Crea utilidades reutilizables. Un script = Una función atómica.
3.  **Idempotencia**: Ejecutar una instalación 10 veces no debe romper nada. Debe detectar "Ya instalado" y salir graciosamente.
4.  **No Burocracia**: Priorizamos features sobre papeleo. El código manda.

## 2.1 Reglas de Proceso (Iron Rules)
1.  **Commit Diario**: Al terminar una funcionalidad, SIEMPRE haz commit. "Si no está en git, no existe".
2.  **Verificación Paranoica**: Después de generar código, CORRELO. No asumas que funciona.
3.  **Ciclo de Mejora**: Si la verificación falla, corrige inmediatamente antes de pasar a la siguiente fase.

## 3. Principios de Ingeniería (Vital Concepts)

### A. Antifragilidad
El sistema no solo debe ser robusto (aguantar golpes), sino antifrágil (mejorar con los golpes).
- **Auto-Corrección**: Si una descarga falla, el sistema reintenta con otro mirror o método.
- **Watchdogs**: Procesos guardianes que vigilan la salud de los procesos principales.

### B. "Zero Config" Mental Model
El usuario final NO es un SysAdmin.
- No pedir editar JSONs o variables de entorno a mano.
- Detectar rutas automáticamente.
- Valores por defecto sensatos.

### C. Feedback Loops Inmediatos
Latency Kills Experience.
- **UI Optimista**: Actualizar la interfaz antes de que termine la acción (con spinner).
- **Streaming Logs**: No esperar a que termine el comando para mostrar output.

### D. Seguridad por Diseño
- **Principio de Menor Privilegio**: No pedir permisos de Admin a menos que sea estrictamente necesario (aunque para instalaciones suele serlo, sé consciente).
- **Sanitización**: Nunca pasar input del usuario directamente a `exec()`.

## 4. Estándares Técnicos
- **Frontend**: React + Vite + Tailwind + Lucide.
- **Backend**: Node.js puro o Express + Socket.IO (Winston Logger).
- **Scripts**: PowerShell (.ps1) para lógica compleja, Batch (.bat) para wrappers simples.
