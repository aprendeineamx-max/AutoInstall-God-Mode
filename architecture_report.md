# AutoInstall God Mode - System Architecture Report

## 1. Executive Summary
"AutoInstall God Mode" is a high-capability system automation agent designed to act as a "Developer Operating System". Its core philosophy is **Autopoiesis**—the system is self-maintaining, self-correcting, and robust. It moves beyond simple scripts to provide a managed, API-driven layer over system tools like Winget, Chocolatey, and Scoop.

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer [Frontend (Web Interface)]
        UI[React Dashboard]
        WS_Client[Socket.IO Client]
        API_Client[Fetch API]
    end

    subgraph Agent Layer [Node.js Backend]
        Server[Express Server]
        WS_Server[Socket.IO Server]
        Watchdog[Watchdog Service]
        
        subgraph Core Modules
            SI[Smart Installer]
            SM[Stack Manager]
            PR[Profiler]
            FM[File Manager]
            LOG[Logger]
        end
        
        subgraph Data & State
            Manifest[Universal Manifest]
            State[Tools State JSON]
            Stacks[Stacks Library]
        end
    end

    subgraph System Layer [Operating System]
        Shell[PowerShell / CMD]
        PM[Package Managers]
        
        PM_W[Winget]
        PM_C[Chocolatey]
        PM_S[Scoop]
        
        FS[File System]
    end

    %% Interactions
    UI -->|HTTP Requests| Server
    WS_Client <-->|Real-time Logs| WS_Server
    
    Server --> SI
    Server --> SM
    Server --> PR
    Server --> FM
    
    SI -->|Read/Write| State
    SI -->|Read| Manifest
    SI -->|Execute| Shell
    
    SM -->|Hydrate| SI
    SM -->|Read| Stacks
    
    Shell --> PM
    PM --> PM_W
    PM --> PM_C
    PM --> PM_S
    
    Watchdog -.->|Monitor/Restart| Server
```

## 3. Core Component Analysis

### A. The Agent (Backend)
Located in `/agent`, this is the brain of the system.
- **Server (`server.js`)**: Exposes REST endpoints for system control and serves the static frontend. It initializes the `SmartInstaller` and `Logger`.
- **Smart Installer (`smartInstaller.js`)**: The "Autopoiesis" engine.
  - **Self-Healing**: Automatically detects if Winget/Choco/Scoop are missing and attempts to install them.
  - **Universal Resolution**: Decides which package manager to use based on a `universal_manifest.json` priority list (Winget > Choco > Scoop).
  - **Requirements Checking**: Verifies RAM/Disk/Virtualization requirements before attempting installations.
- **Stack Manager (`stackManager.js`)**: Handles "Neural Stacks" (`.ai-stack` files)—JSON definitions of complete dev environments (packages, VS Code extensions, scripts).
- **Watchdog (`watchdog.js`)**: A separate process that monitors the main server. If the server crashes, the Watchdog restarts it immediately, ensuring high availability.

### B. The Web Interface (Frontend)
Located in `/web-interface`, built with React + Vite + Tailwind.
- **Dashboard (`App.jsx`)**: A "God Mode" dashboard showing:
  - **Deep System Stats**: Real-time CPU, RAM (with usage bars), GPU, and OS info.
  - **Script Marketplace**: List of available automation scripts with status indicators.
  - **Terminal**: Real-time streaming logs from the agent via WebSockets.
  - **File Explorer**: A capability to browse the host file system.

### C. The Script Layer
Located in `/scripts`.
- Acts as the "muscle" of the system.
- Each script (e.g., `nodejs`, `python`) is a self-contained module, often with its own `install.bat` or `install.ps1`.
- The Agent scans this directory dynamically to populate the "Marketplace".

## 4. Key Data Flows

### Installation Flow
1. **User Request**: User clicks "Install" on the Web UI.
2. **API Call**: Frontend sends `POST /execute` with `scriptId`.
3. **Smart Resolution**: `SmartInstaller` checks `universal_manifest.json`.
   - If a package manager source is found (e.g., Winget id), it constructs the specific command.
   - If not, it falls back to the legacy `install.bat` in the `/scripts` folder.
4. **Execution**: The Agent spawns a detached `cmd.exe` process (visual feedback for user) or runs silently depending on configuration.
5. **Feedback**: Logs are streamed via Socket.IO back to the web terminal.

### Autopoiesis Flow (Self-Correction)
1. **Startup**: `server.js` calls `smartInstaller.provisionPackageManagers()`.
2. **Detection**: Checks presence of `winget`, `choco`, `scoop`.
3. **Healing**: If (e.g.) `choco` is missing, it downloads and executes the Chocolatey install script automatically.
4. **State Update**: Updates `tools_state.json` with the health status of each manager.

## 5. Directory Structure
```
root
├── agent/                  # Node.js Backend
│   ├── server.js           # Entry point
│   ├── smartInstaller.js   # Logic engine
│   ├── universal_manifest.json # Package database
│   └── ...
├── web-interface/          # React Frontend
│   ├── src/
│   │   ├── App.jsx         # Main Dashboard
│   │   └── ...
│   └── ...
├── scripts/                # Legacy/Custom Scripts
│   ├── nodejs/
│   ├── python/
│   └── ...
├── stacks/                 # Environment Definitions
│   ├── full-stack.ai-stack
│   └── ...
└── 0. Portables/           # Portable tools cache
```

## 6. Detailed Capabilities
- **God Mode Filesystem**: The API (`/fs/list`, `/fs/read`) allows the frontend to theoretically traverse and edit the entire host filesystem (dangerous but powerful).
- **Deep Profiling**: `profiler.js` uses WMI/OS commands to fetch hardware serials, extensive memory stats, and virtualization support.
- **Stack Hydration**: Can turn a single JSON file into a fully configured machine (installing 10+ apps and extensions in one go).

## 7. Recommendations for Future Work
- **Security**: The `/execute` and `/fs/*` endpoints are unauthenticated. Adding an API Key or Token auth is critical for production.
- **Queue System**: Currently, installations might overlap. A job queue would prevent conflicts.
- **Headless Mode**: Decouple the "detached window" logic to allow fully background installations.
