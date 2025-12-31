import { useState, useEffect, useRef } from 'react'
import { Terminal, Settings, RefreshCw, Box, Play, AlertTriangle, Monitor } from 'lucide-react'
import { io } from 'socket.io-client';

// AGENT URL - In production this should be dynamic or configurable
const AGENT_API = 'http://localhost:3000';

function App() {
    const [status, setStatus] = useState(null);
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState(null);
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    useEffect(() => {
        checkStatus();
        fetchScripts();

        // Socket.IO Connection
        const socket = io(AGENT_API);

        socket.on('connect', () => {
            console.log('Connected to Agent WS');
        });

        socket.on('log', (log) => {
            setLogs(prev => [...prev.slice(-99), log]); // Keep last 100 logs
        });

        return () => socket.disconnect();
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const checkStatus = async () => {
        try {
            const res = await fetch(`${AGENT_API}/status`);
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error("Agent offline");
            setStatus(null);
        }
    };

    const fetchScripts = async () => {
        try {
            const res = await fetch(`${AGENT_API}/scripts`);
            const data = await res.json();
            setScripts(data);
        } catch (e) {
            console.error("Failed to fetch scripts");
        }
    };

    const handleInstall = async (scriptId) => {
        if (!status) return alert("Agent is offline!");

        setInstalling(scriptId);

        // Default env vars for now. ideally this opens a modal form.
        const envVars = {};

        try {
            const res = await fetch(`${AGENT_API}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptId, envVars })
            });
            const data = await res.json();
            // Alert is no longer needed as logs will show the action
            // alert(`Output: ${data.message || data.error}`);
        } catch (e) {
            alert("Error starting installation");
        } finally {
            setInstalling(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 font-sans">
            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                        <Box className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AutoInstall Hub</h1>
                        <p className="text-slate-400 text-sm">Control remote system deployments</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status?.online ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${status?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{status?.online ? 'AGENT ONLINE' : 'DISCONNECTED'}</span>
                    </div>
                    <button onClick={() => { checkStatus(); fetchScripts(); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* System Stats Card (Mockup) */}
                <div className="col-span-1 lg:col-span-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="text-slate-400 text-sm mb-2">Target Machine</h3>
                            <p className="text-2xl font-mono text-white">{status?.hostname || '---'}</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="text-slate-400 text-sm mb-2">Network IP</h3>
                            <p className="text-2xl font-mono text-white">{status?.ip || '---'}</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="text-slate-400 text-sm mb-2">Platform</h3>
                            <p className="text-2xl font-mono text-white capitalize">{status?.platform || '---'}</p>
                        </div>
                    </div>
                </div>

                {/* LOG TERMINAL - NEW */}
                <div className="col-span-1 lg:col-span-3 bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-sm mb-6">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400 font-medium">System Matrix Log</span>
                    </div>
                    <div className="h-64 overflow-y-auto p-4 space-y-1">
                        {logs.length === 0 && <span className="text-slate-600 italic">Waiting for telemetry...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={`
                            ${log.level === 'error' ? 'text-red-500' :
                                        log.level === 'warn' ? 'text-yellow-500' : 'text-green-400'}
                        `}>
                                    {log.message}
                                </span>
                                {log.meta && Object.keys(log.meta).length > 0 && (
                                    <span className="text-slate-500 text-xs">{JSON.stringify(log.meta)}</span>
                                )}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Script Cards */}
                {scripts.map((script) => (
                    <div key={script.id} className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Settings className="w-12 h-12 text-blue-500 transform group-hover:rotate-45 transition-transform duration-700" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{script.name}</h3>
                        <p className="text-slate-400 text-sm mb-6">Automated installation package.</p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">v1.0.0</span>

                            <button
                                onClick={() => handleInstall(script.id)}
                                disabled={!status?.online || installing === script.id || !script.hasInstaller}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${!script.hasInstaller ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                                        installing === script.id ? 'bg-yellow-600 text-white cursor-wait' :
                                            'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}
                    `}
                            >
                                {installing === script.id ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Installing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" /> Install
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Reset Card */}
                <div className="group relative bg-red-950/20 border border-red-900/30 hover:border-red-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-red-900/10">
                    <h3 className="text-xl font-bold text-red-400 mb-2">System Reset</h3>
                    <p className="text-red-300/60 text-sm mb-6">Dangerous. Removes all configurations.</p>
                    <button
                        onClick={() => handleInstall('reset')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 transition-all font-medium">
                        <AlertTriangle className="w-4 h-4" /> Reset Tools
                    </button>
                </div>

            </main>
        </div>
    )
}

export default App
