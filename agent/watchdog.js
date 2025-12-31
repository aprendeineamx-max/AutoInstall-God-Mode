const { spawn } = require('child_process');
const http = require('http');

const SERVER_SCRIPT = 'server.js';
const PORT = 3000;
const CHECK_INTERVAL_MS = 5000;
const MAX_FAILURES = 3;

let failureCount = 0;
let serverProcess = null;

function log(msg) {
    const timestamp = new Date().toISOString();
    console.log(`[WATCHDOG] ${timestamp} - ${msg}`);
}

function startServer() {
    log('Spawning Agent Server...');
    serverProcess = spawn('node', [SERVER_SCRIPT], {
        stdio: 'inherit',
        env: process.env,
        shell: true
    });

    serverProcess.on('exit', (code, signal) => {
        log(`Agent Server exited with code: ${code} / signal: ${signal}`);
        serverProcess = null;
        // Immediate restart if it crashes hard
        if (code !== 0) {
            log('Crash detected. Restarting immediately...');
            startServer();
        }
    });
}

function checkHealth() {
    const req = http.get(`http://localhost:${PORT}/status`, (res) => {
        if (res.statusCode === 200) {
            // log('Health check: OK');
            failureCount = 0;
        } else {
            handleFailure(`Status code: ${res.statusCode}`);
        }
    });

    req.on('error', (err) => {
        handleFailure(err.message);
    });

    req.setTimeout(2000, () => {
        req.destroy();
        handleFailure('Timeout');
    });
}

function handleFailure(reason) {
    failureCount++;
    log(`Health check FAILED (${failureCount}/${MAX_FAILURES}): ${reason}`);

    if (failureCount >= MAX_FAILURES) {
        log('MAX FAILURES REACHED. KILLING AND RESTARTING AGENT...');
        if (serverProcess) {
            serverProcess.kill();
            // The 'exit' listener will trigger the restart
        } else {
            // Should verify if port is blocked or process acts zombie
            startServer();
        }
        failureCount = 0;
    }
}

// Start
log('Starting Sentinel Watchdog System...');
startServer();

// Monitoring Loop
setInterval(checkHealth, CHECK_INTERVAL_MS);
