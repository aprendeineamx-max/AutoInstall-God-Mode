import React, { useState, useEffect } from 'react';
import { Package, Laptop, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function StacksMarketplace() {
    const [stacks, setStacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hydrating, setHydrating] = useState(null); // ID of stack being hydrated
    const [error, setError] = useState(null);

    // Load stacks on mount
    useEffect(() => {
        fetchStacks();
    }, []);

    const fetchStacks = async () => {
        setLoading(true);
        try {
            // Using relative path assuming proxy or same origin
            const res = await fetch('http://localhost:3000/api/stacks');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStacks(data);
            } else {
                throw new Error('Invalid format');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load stacks market.');
        } finally {
            setLoading(false);
        }
    };

    const handleHydrate = async (filename) => {
        if (!confirm(`Are you sure you want to dehydrate this stack? This will install multiple packages.`)) return;

        setHydrating(filename);
        try {
            const res = await fetch('http://localhost:3000/api/stacks/hydrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Hydration Complete!\nCheck logs for details.`);
            } else {
                alert(`Hydration Failed: ${result.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setHydrating(null);
        }
    };

    if (loading) return <div className="p-10 text-white animate-pulse">Loading Neuro-Stacks...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="h-full p-6 bg-slate-900 overflow-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                    Neural Stacks Marketplace
                </h1>
                <p className="text-slate-400">
                    Pre-configured development environments. Click to hydrate.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stacks.map((stack) => (
                    <StackCard
                        key={stack.filename}
                        stack={stack}
                        onHydrate={handleHydrate}
                        isHydrating={hydrating === stack.filename}
                    />
                ))}
            </div>
        </div>
    );
}

function StackCard({ stack, onHydrate, isHydrating }) {
    const { meta, valid, error } = stack;

    if (!valid) {
        return (
            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl opacity-70">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle size={20} />
                    <span className="font-bold">Invalid Stack</span>
                </div>
                <p className="text-sm text-red-300">{stack.filename}</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-6 rounded-xl hover:border-purple-500/50 transition-all shadow-xl hover:shadow-purple-500/10 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Package size={24} />
                </div>
                {isHydrating && <div className="animate-spin text-purple-400">⏳</div>}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{meta.name}</h3>
            <p className="text-sm text-slate-400 mb-4 h-10 line-clamp-2">{meta.description}</p>

            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Laptop size={14} />
                    <span>Min RAM: {stack.requirements?.minRamGB || 'Any'}GB</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {stack.packages?.slice(0, 3).map((p, i) => (
                        <span key={i} className="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded">
                            {typeof p === 'string' ? p : p.id}
                        </span>
                    ))}
                    {(stack.packages?.length > 3) && <span className="text-xs text-slate-500">+{stack.packages.length - 3}</span>}
                </div>
            </div>

            <button
                onClick={() => onHydrate(stack.filename)}
                disabled={isHydrating}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                    ${isHydrating
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/20'
                    }`}
            >
                {isHydrating ? 'Hydrating...' : (
                    <>
                        <Play size={16} />
                        Hydrate System
                    </>
                )}
            </button>
        </div>
    );
}
