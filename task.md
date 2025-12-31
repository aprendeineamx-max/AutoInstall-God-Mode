# Lista de Tareas: Ecosistema AutoInstall Premium

## Fase 1: Fundamentos (Completado) <!-- id: 0 -->
- [x] Arquitectura Modular (Scripts/Agent/Web) <!-- id: 1 -->
- [x] Bootstrapping (Node/Python) <!-- id: 2 -->
- [x] Agente Básico y Web UI <!-- id: 3 -->
- [x] Empaquetado Portable <!-- id: 4 -->

## Fase 2: Robustez y "Autopoiesis" (Nucleo Profundo) <!-- id: 5 -->
- [x] **Sistema de Logging Centralizado** <!-- id: 6 -->
    - [x] Winston/Bunyan en el Agente <!-- id: 7 -->
    - [x] Streaming de logs en tiempo real vía WebSockets <!-- id: 8 -->
- [x] **Mecanismos de Autopoiesis (Auto-reparación)** <!-- id: 9 -->
    - [x] Watchdog que reinicia el agente si cae <!-- id: 10 -->
    - [ ] Script de auto-actualización del propio sistema <!-- id: 11 -->
- [ ] **Manejo de Errores y Rollback** <!-- id: 12 -->
    - [ ] Detectar fallos en `winget` y reintentar <!-- id: 13 -->
    - [ ] Restaurar estado anterior si falla una instalación crítica <!-- id: 14 -->

## Fase 3: El Catálogo Universal (Expansión) <!-- id: 15 -->
- [ ] **Estandarización de Metadatos** <!-- id: 16 -->
    - [ ] `manifest.json` para cada tool (Icono, Descripción, Categoría) <!-- id: 17 -->
- [ ] **Integración Multi-Fuente** <!-- id: 18 -->
    - [ ] Soporte para Chocolatey y Scoop (además de Winget) <!-- id: 19 -->
    - [ ] Soporte para Docker Containers <!-- id: 20 -->
    - [ ] Soporte para extensiones de VS Code <!-- id: 21 -->
- [ ] **Creación Masiva de Scripts** <!-- id: 22 -->
    - [ ] Java, C++, Rust, Go, PHP, Docker, Kubernetes... <!-- id: 23 -->

## Fase 4: Funciones Premium y Marketplace <!-- id: 24 -->
- [ ] **Constructor de "Stacks" (Recipes)** <!-- id: 25 -->
    - [ ] Crear recetas personalizadas (ej: "Fullstack JS": Node + Mongo + VS Code) <!-- id: 26 -->
    - [ ] Instalación en cadena con un solo clic <!-- id: 27 -->
- [ ] **Snapshots de Configuración** <!-- id: 28 -->
    - [ ] Exportar estado actual de la PC a un JSON <!-- id: 29 -->
    - [ ] Importar/Replicar estado en otra máquina <!-- id: 30 -->
- [ ] **Interfaz "God Mode"** <!-- id: 31 -->
    - [ ] Terminal embebida en la web <!-- id: 32 -->
    - [ ] Explorador de archivos remoto <!-- id: 33 -->

## Fase 5: Gobernanza y Calidad <!-- id: 34 -->
- [x] Auditoría y limpieza del repositorio <!-- id: 35 -->
- [x] Actualizar documentación técnica (artifacts) <!-- id: 36 -->
- [x] Crear `agent.md` (Reglas del Sistema) <!-- id: 37 -->
