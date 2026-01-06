# AutoInstall God Mode - Reporte de Arquitectura del Sistema

## 1. Resumen Ejecutivo
"AutoInstall God Mode" es un sistema de automatización de alto nivel diseñado para actuar como un "Sistema Operativo para Desarrolladores". Su filosofía central es la **Autopoiesis**: el sistema es auto-mantenible, auto-corregible y robusto. Va más allá de simples scripts para proporcionar una capa gestionada vía API sobre herramientas del sistema como Winget, Chocolatey y Scoop.

## 2. Diagrama de Arquitectura de Alto Nivel

```mermaid
graph TD
    subgraph Capa Cliente [Frontend (Interfaz Web)]
        UI[Dashboard React]
        WS_Client[Cliente Socket.IO]
        API_Client[Fetch API]
    end

    subgraph Capa Agente [Backend Node.js]
        Server[Servidor Express]
        WS_Server[Servidor Socket.IO]
        Watchdog[Servicio Watchdog]
        
        subgraph Modulos Core
            SI[Instalador Inteligente]
            SM[Gestor de Stacks]
            PR[Perfilador (Profiler)]
            FM[Gestor de Archivos]
            LOG[Logger]
        end
        
        subgraph Datos y Estado
            Manifest[Manifiesto Universal]
            State[Estado de Herramientas JSON]
            Stacks[Biblioteca de Stacks]
        end
    end

    subgraph Capa Sistema [Sistema Operativo]
        Shell[PowerShell / CMD]
        PM[Gestores de Paquetes]
        
        PM_W[Winget]
        PM_C[Chocolatey]
        PM_S[Scoop]
        
        FS[Sistema de Archivos]
    end

    %% Interacciones
    UI -->|Peticiones HTTP| Server
    WS_Client <-->|Logs Tiempo Real| WS_Server
    
    Server --> SI
    Server --> SM
    Server --> PR
    Server --> FM
    
    SI -->|Leer/Escribir| State
    SI -->|Leer| Manifest
    SI -->|Ejecutar| Shell
    
    SM -->|Hidratar| SI
    SM -->|Leer| Stacks
    
    Shell --> PM
    PM --> PM_W
    PM --> PM_C
    PM --> PM_S
    
    Watchdog -.->|Monitorear/Reiniciar| Server
```

## 3. Análisis de Componentes Principales

### A. El Agente (Backend)
Ubicado en `/agent`, es el cerebro del sistema.
- **Server (`server.js`)**: Expone endpoints REST para control del sistema y sirve el frontend estático. Inicializa el `SmartInstaller` y el `Logger`.
- **Instalador Inteligente (`smartInstaller.js`)**: El motor de "Autopoiesis".
  - **Auto-Curación**: Detecta automáticamente si faltan Winget/Choco/Scoop e intenta instalarlos.
  - **Resolución Universal**: Decide qué gestor de paquetes usar basado en una lista de prioridad definida en `universal_manifest.json` (Winget > Choco > Scoop).
  - **Verificación de Requisitos**: Verifica RAM/Disco/Virtualización antes de intentar instalaciones.
- **Gestor de Stacks (`stackManager.js`)**: Maneja "Neural Stacks" (archivos `.ai-stack`)—definiciones JSON de entornos de desarrollo completos (paquetes, extensiones de VS Code, scripts).
- **Watchdog (`watchdog.js`)**: Un proceso separado que vigila al servidor principal. Si el servidor falla, el Watchdog lo reinicia inmediatamente, asegurando alta disponibilidad.

### B. La Interfaz Web (Frontend)
Ubicada en `/web-interface`, construida con React + Vite + Tailwind.
- **Dashboard (`App.jsx`)**: Un panel de control "God Mode" que muestra:
  - **Estadísticas Profundas**: CPU, RAM (con barras de uso), GPU e información del SO en tiempo real.
  - **Marketplace de Scripts**: Lista de scripts de automatización disponibles con indicadores de estado.
  - **Terminal**: Logs en tiempo real transmitidos desde el agente vía WebSockets.
  - **Explorador de Archivos**: Capacidad para navegar el sistema de archivos del host.

### C. La Capa de Scripts
Ubicada en `/scripts`.
- Actúa como el "músculo" del sistema.
- Cada script (ej. `nodejs`, `python`) es un módulo autocontenido, a menudo con su propio `install.bat` o `install.ps1`.
- El Agente escanea este directorio dinámicamente para poblar el "Marketplace".

## 4. Flujos de Datos Clave

### Flujo de Instalación
1. **Solicitud de Usuario**: El usuario hace clic en "Instalar" en la UI Web.
2. **Llamada API**: El frontend envía `POST /execute` con `scriptId`.
3. **Resolución Inteligente**: `SmartInstaller` verifica `universal_manifest.json`.
   - Si encuentra una fuente de gestor de paquetes (ej. id de Winget), construye el comando específico.
   - Si no, recurre al script legado `install.bat` en la carpeta `/scripts`.
4. **Ejecución**: El Agente lanza un proceso `cmd.exe` desconectado (feedback visual para el usuario) o corre silenciosamente según configuración.
5. **Feedback**: Los logs se transmiten vía Socket.IO de vuelta a la terminal web.

### Flujo de Autopoiesis (Auto-Corrección)
1. **Inicio**: `server.js` llama a `smartInstaller.provisionPackageManagers()`.
2. **Detección**: Verifica la presencia de `winget`, `choco`, `scoop`.
3. **Curación**: Si (por ejemplo) falta `choco`, descarga y ejecuta el script de instalación de Chocolatey automáticamente.
4. **Actualización de Estado**: Actualiza `tools_state.json` con el estado de salud de cada gestor.

## 5. Estructura de Directorios
```
root
├── agent/                  # Backend Node.js
│   ├── server.js           # Punto de entrada
│   ├── smartInstaller.js   # Motor lógico
│   ├── universal_manifest.json # Base de datos de paquetes
│   └── ...
├── web-interface/          # Frontend React
│   ├── src/
│   │   ├── App.jsx         # Dashboard Principal
│   │   └── ...
│   └── ...
├── scripts/                # Scripts Legados/Custom
│   ├── nodejs/
│   ├── python/
│   └── ...
├── stacks/                 # Definiciones de Entorno
│   ├── full-stack.ai-stack
│   └── ...
└── 0. Portables/           # Caché de herramientas portátiles
```

## 6. Capacidades Detalladas
- **Sistema de Archivos God Mode**: La API (`/fs/list`, `/fs/read`) permite al frontend atravesar y editar teóricamente todo el sistema de archivos del host (peligroso pero poderoso).
- **Perfilado Profundo**: `profiler.js` usa comandos WMI/SO para obtener seriales de hardware, estadísticas extensas de memoria y soporte de virtualización.
- **Hidratación de Stacks**: Puede convertir un solo archivo JSON en una máquina completamente configurada (instalando 10+ aplicaciones y extensiones de una sola vez).

## 7. Recomendaciones Futuras
- **Seguridad**: Los endpoints `/execute` y `/fs/*` no están autenticados. Añadir API Key o Token auth es crítico para producción.
- **Sistema de Colas**: Actualmente, las instalaciones podrían solaparse. Una cola de trabajos evitaría conflictos.
- **Modo Headless**: Desacoplar la lógica de "ventana desconectada" para permitir instalaciones totalmente en segundo plano.
