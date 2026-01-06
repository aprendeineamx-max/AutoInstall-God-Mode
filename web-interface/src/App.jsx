import { useState, useEffect, useRef } from 'react'
import { Terminal, Settings, RefreshCw, Box, Play, AlertTriangle, Monitor, FolderOpen, Trash2, RotateCcw, Globe, Github, ChevronDown } from 'lucide-react'
import { io } from 'socket.io-client';
import FileExplorer from './components/FileExplorer';
import StacksMarketplace from './components/StacksMarketplace';

// AGENT URL - In production this should be dynamic or configurable
// AGENT URL - In production this should be dynamic or configurable
const AGENT_API = 'http://localhost:3000';
const AGENT_KEY = 'godmode'; // Matching server default

function App() {
    /* eslint-disable react/prop-types */
    const [status, setStatus] = useState(null);
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState(null);
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);
    const [capabilities, setCapabilities] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // Track open dropdowns

    useEffect(() => {
        checkStatus();
        fetchScripts();
        fetchCapabilities(); // New

        // Socket.IO Connection
        const socket = io(AGENT_API, {
            auth: { token: AGENT_KEY }
        });

        socket.on('connect', () => {
            console.log('Connected to Agent WS');
        });

        socket.on('log', (log) => {
            setLogs(prev => [...prev.slice(-99), log]); // Keep last 100 logs
        });

        // Close menus on click outside
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);

        return () => {
            socket.disconnect();
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const checkStatus = async () => {
        try {
            // Status endpoint is public (allowed in middleware), but good practice to send key
            const res = await fetch(`${AGENT_API}/status`, {
                headers: { 'x-agent-key': AGENT_KEY }
            });
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error("Agent offline");
            setStatus(null);
        }
    };

    const fetchScripts = async () => {
        try {
            const res = await fetch(`${AGENT_API}/scripts`, {
                headers: { 'x-agent-key': AGENT_KEY }
            });
            const data = await res.json();
            setScripts(data);
        } catch (e) {
            console.error("Failed to fetch scripts");
        }
    };

    const fetchCapabilities = async () => {
        try {
            const res = await fetch(`${AGENT_API}/capabilities`, {
                headers: { 'x-agent-key': AGENT_KEY }
            });
            const data = await res.json();
            setCapabilities(data);
        } catch (e) {
            console.error("Failed to fetch capabilities");
        }
    };

    const handleInstall = async (scriptId, command = null, e = null) => {
        if (e) e.stopPropagation(); // Prevent menu close from immediately triggering other things if needed
        if (!status) return alert("Agent is offline!");

        setInstalling(scriptId);

        // Default env vars for now. ideally this opens a modal form.
        const envVars = {};

        try {
            const res = await fetch(`${AGENT_API}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-agent-key': AGENT_KEY
                },
                body: JSON.stringify({ scriptId, envVars, command }) // Send optional command
            });
            await res.json();
            // Refresh logic after a delay
            setTimeout(fetchScripts, 5000);
        } catch (e) {
            alert("Error starting installation");
        } finally {
            setInstalling(null);
            setOpenMenuId(null);
        }
    };

    const handleOpen = async (scriptId) => {
        try {
            await fetch(`${AGENT_API}/open-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-agent-key': AGENT_KEY
                },
                body: JSON.stringify({ scriptId })
            });
        } catch (e) {
            alert("Error opening location");
        }
    };

    const handleUninstall = async (scriptId) => {
        if (!confirm("Are you sure you want to uninstall this tool?")) return;
        try {
            await fetch(`${AGENT_API}/uninstall`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-agent-key': AGENT_KEY
                },
                body: JSON.stringify({ scriptId })
            });
            setTimeout(fetchScripts, 5000);
        } catch (e) {
            alert("Error starting uninstallation");
        }
    };

    // Helper to format bytes
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                    <button onClick={() => { checkStatus(); fetchScripts(); fetchCapabilities(); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Deep System Stats Card */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* CPU */}
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                            <h3 className="text-blue-400 text-xs uppercase font-bold tracking-wider mb-2">Processing Unit</h3>
                            <p className="text-lg font-bold text-white truncate">{capabilities?.cpu?.brand || 'Scanning...'}</p>
                            <div className="flex justify-between mt-2 text-slate-400 text-xs font-mono">
                                <span>{capabilities?.cpu?.cores} Cores</span>
                                <span>{capabilities?.cpu?.speed} GHz</span>
                            </div>
                        </div>

                        {/* MEMORY */}
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                            <h3 className="text-purple-400 text-xs uppercase font-bold tracking-wider mb-2">Memory</h3>
                            <p className="text-lg font-bold text-white">
                                {capabilities ? `${formatBytes(capabilities.memory.active)} / ${formatBytes(capabilities.memory.total)}` : 'Scanning...'}
                            </p>
                            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: capabilities ? `${(capabilities.memory.active / capabilities.memory.total) * 100}%` : '0%' }} />
                            </div>
                        </div>

                        {/* OS & DISK */}
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                            <h3 className="text-emerald-400 text-xs uppercase font-bold tracking-wider mb-2">Operating System</h3>
                            <p className="text-lg font-bold text-white truncate">{capabilities?.os?.distro || 'Scanning...'}</p>
                            <p className="text-slate-400 text-xs mt-1">Disk: {capabilities ? `${capabilities.storage.percent.toFixed(0)}% Used` : '...'}</p>
                        </div>

                        {/* GPU & FEATURES */}
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
                            <h3 className="text-orange-400 text-xs uppercase font-bold tracking-wider mb-2">Graphics & AI</h3>
                            <p className="text-lg font-bold text-white truncate">
                                {capabilities?.gpu?.[0]?.model || 'No GPU Detected'}
                            </p>
                            <div className="flex gap-2 mt-2">
                                {capabilities?.features?.hyperv && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">HYPER-V</span>}
                                {capabilities?.features?.docker && <span className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 text-[10px] border border-blue-800">DOCKER</span>}
                            </div>
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

                {/* GOD MODE FILE EXPLORER */}
                <div className="col-span-1 lg:col-span-3 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">God Mode Explorer</h2>
                    </div>
                    <FileExplorer />
                </div>

                {/* NEURAL STACKS MARKETPLACE */}
                <div className="col-span-1 lg:col-span-3 mb-6 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <StacksMarketplace />
                </div>

                {/* Script Cards */}
                {scripts.map((script) => (
                    <div key={script.id} className={`group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:shadow-2xl overflow-hidden
                        ${script.status === 'installed' ? 'hover:border-green-500/50 hover:shadow-green-900/10' : 'hover:border-blue-500/50 hover:shadow-blue-900/10'}
                    `}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Settings className="w-12 h-12 text-slate-500 transform group-hover:rotate-45 transition-transform duration-700" />
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white">{script.name}</h3>
                            {script.status === 'installed' && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">INSTALLED</span>
                            )}
                        </div>

                        <p className="text-slate-400 text-sm mb-6">{script.description}</p>

                        <div className="flex items-center justify-between mt-auto gap-2">
                            {/* Actions based on status */}
                            {script.status === 'installed' ? (
                                <>
                                    <button
                                        onClick={() => handleOpen(script.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <FolderOpen className="w-4 h-4" /> Open
                                    </button>
                                    <button
                                        onClick={() => handleUninstall(script.id)}
                                        className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-500 transition-colors border border-red-900/30"
                                        title="Uninstall"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex-1 flex touch-none isolate relative rounded-lg shadow-lg shadow-blue-500/20">
                                    {/* Main Button */}
                                    <button
                                        onClick={() => handleInstall(script.id)}
                                        disabled={!status?.online || installing === script.id || !script.hasInstaller}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all
                                        ${script.manifest?.installOptions ? 'rounded-l-lg' : 'rounded-lg'}
                                        ${!script.hasInstaller ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                                                installing === script.id ? 'bg-yellow-600 text-white cursor-wait' :
                                                    'bg-blue-600 hover:bg-blue-500 text-white'}
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

                                    {/* Split Dropdown Trigger */}
                                    {script.manifest?.installOptions && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === script.id ? null : script.id);
                                                }}
                                                disabled={installing === script.id}
                                                className={`px-2 py-2 border-l border-blue-700 bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg transition-colors
                                                 ${installing === script.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === script.id && (
                                                <div className="absolute top-12 right-0 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    <div className="p-1">
                                                        {script.manifest.installOptions.map((opt, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => handleInstall(script.id, opt.command, e)}
                                                                className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
                                                            >
                                                                {opt.icon === 'github' ? <Github className="w-4 h-4 text-purple-400" /> :
                                                                    opt.icon === 'globe' ? <Globe className="w-4 h-4 text-blue-400" /> :
                                                                        opt.icon === 'box' ? <Box className="w-4 h-4 text-cyan-400" /> :
                                                                            opt.icon === 'microsoft' ? <Box className="w-4 h-4 text-cyan-400" /> :
                                                                                <Play className="w-4 h-4 text-slate-400" />}
                                                                <div className="flex flex-col">
                                                                    <span>{opt.label}</span>
                                                                    <span className="text-[10px] text-slate-500 capitalize">{opt.source}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Reinstall Option (Small) if installed */}
                            {script.status === 'installed' && (
                                <button
                                    onClick={() => handleInstall(script.id)}
                                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                                    title="Reinstall/Update"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
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
