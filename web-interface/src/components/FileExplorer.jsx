import { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, HardDrive, RefreshCw } from 'lucide-react';

/* eslint-disable react/prop-types */
const AGENT_API = 'http://localhost:3000';

const FileExplorer = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    useEffect(() => {
        // Initial load (root)
        loadDir('');
    }, []);

    const loadDir = async (path) => {
        setLoading(true);
        try {
            const url = `${AGENT_API}/fs/list${path ? `?path=${encodeURIComponent(path)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.entries) {
                // Sort folders first
                const sorted = data.entries.sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'directory' ? -1 : 1;
                });
                setEntries(sorted);
                setCurrentPath(data.path);
            }
        } catch (e) {
            console.error("FS Error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = async (entry) => {
        if (entry.type === 'directory') {
            loadDir(entry.path);
        } else {
            setSelectedFile(entry);
            // Read file content
            try {
                const res = await fetch(`${AGENT_API}/fs/read?path=${encodeURIComponent(entry.path)}`);
                const data = await res.json();
                setFileContent(data.content);
            } catch (e) {
                setFileContent("Error reading file or file too large.");
            }
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-mono text-sm truncate">
                    <HardDrive className="w-4 h-4 text-blue-500" />
                    <span>{currentPath || 'Root'}</span>
                </div>
                <button onClick={() => loadDir(currentPath)} className="text-slate-400 hover:text-white">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* File Tree (Left) */}
                <div className="w-1/3 bg-slate-900/50 border-r border-slate-800 overflow-y-auto p-2">
                    {/* Parent Dir Button (Go Up) */}
                    <div
                        onClick={() => {
                            const newPath = currentPath.split('\\').slice(0, -1).join('\\');
                            // Simple primitive go up logic for Windows paths, creates bugs if naive but ok for validation
                            loadDir(newPath || '.');
                        }}
                        className="px-2 py-1.5 flex items-center gap-2 text-slate-400 hover:bg-slate-800 rounded cursor-pointer mb-2 text-sm"
                    >
                        <ChevronDown className="w-4 h-4" /> ..
                    </div>

                    {entries.map((entry, i) => (
                        <div
                            key={i}
                            onClick={() => handleFileClick(entry)}
                            className={`px-2 py-1.5 flex items-center gap-2 rounded cursor-pointer text-sm truncate transition-colors
                                ${selectedFile?.path === entry.path ? 'bg-blue-900/50 text-blue-300' : 'text-slate-300 hover:bg-slate-800'}
                            `}
                        >
                            {entry.type === 'directory' ?
                                <Folder className="w-4 h-4 text-yellow-500 shrink-0" /> :
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            }
                            <span className="truncate">{entry.name}</span>
                        </div>
                    ))}
                </div>

                {/* Editor / Preview (Right) */}
                <div className="flex-1 bg-slate-950 p-0 overflow-hidden flex flex-col">
                    {selectedFile ? (
                        <>
                            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 flex justify-between">
                                <span>{selectedFile.name}</span>
                                <span>{selectedFile.size} bytes</span>
                            </div>
                            <textarea
                                className="flex-1 bg-slate-950 text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none"
                                value={fileContent}
                                readOnly // For now, read-only first
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                            Select a file to view content
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileExplorer;
