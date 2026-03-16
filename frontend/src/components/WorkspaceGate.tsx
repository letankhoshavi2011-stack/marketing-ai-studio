/**
 * WorkspaceGate — Full-screen overlay requiring workspace selection.
 * Cannot be bypassed. Shown whenever activeWorkspace is null.
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, FolderOpen, ChevronRight, Trash2, Check, Layout } from 'lucide-react';
import { AppLogo } from './Icons';
import { useAppStore } from '../store/appStore';
import { workspaceApi } from '../services/api';
import { WorkspaceAvatar } from './WorkspaceAvatar';

export default function WorkspaceGate() {
    const { workspaces, setWorkspaces, setActiveWorkspace, activeWorkspace } = useAppStore();
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        workspaceApi.list()
            .then(list => {
                setWorkspaces(Array.isArray(list) ? list : []);
            })
            .catch(() => { })
            .finally(() => setInitialLoading(false));
    }, []);

    const handleSelect = (ws: any) => setActiveWorkspace(ws);

    const handleCreate = async () => {
        if (!name.trim()) { setError('Name is required'); return; }
        setLoading(true);
        setError('');
        try {
            const ws = await workspaceApi.create({ name: name.trim(), description: description.trim() });
            setWorkspaces([ws, ...workspaces]);
            setActiveWorkspace(ws);
        } catch {
            setError('Failed to create workspace. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    {/* Animated glow ring */}
                    <div style={{
                        position: 'relative', width: 96, height: 96,
                        margin: '0 auto 24px',
                    }}>
                        {/* Outer spinning ring */}
                        <div style={{
                            position: 'absolute', inset: -8,
                            borderRadius: '50%',
                            border: '2px solid transparent',
                            borderTopColor: '#7c5cff',
                            borderRightColor: 'rgba(124,92,255,0.3)',
                            animation: 'wsLoaderSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                        }} />
                        {/* Inner pulsing ring */}
                        <div style={{
                            position: 'absolute', inset: -4,
                            borderRadius: '50%',
                            border: '1.5px solid transparent',
                            borderBottomColor: '#9b7fff',
                            borderLeftColor: 'rgba(155,127,255,0.2)',
                            animation: 'wsLoaderSpin 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
                        }} />
                        {/* Glow backdrop */}
                        <div style={{
                            position: 'absolute', inset: 6,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)',
                            animation: 'wsLoaderPulse 2s ease-in-out infinite',
                        }} />
                        {/* Logo */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AppLogo size={44} style={{ filter: 'drop-shadow(0 0 12px rgba(124,92,255,0.5))' }} />
                        </div>
                    </div>

                    {/* Animated text */}
                    <p style={{
                        fontSize: 16, fontWeight: 600, margin: '0 0 6px',
                        background: 'linear-gradient(90deg, #7c5cff, #9b7fff, #7c5cff)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'wsLoaderText 2s linear infinite',
                    }}>
                        Loading workspaces
                    </p>
                    {/* Animated dots row */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#7c5cff',
                                animation: `wsLoaderDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                        ))}
                    </div>

                    <style>{`
                        @keyframes wsLoaderSpin { to { transform: rotate(360deg); } }
                        @keyframes wsLoaderPulse { 0%, 100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.08); } }
                        @keyframes wsLoaderText { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                        @keyframes wsLoaderDot { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'var(--bg-primary)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '80px 24px', overflowY: 'auto'
        }} className="custom-scrollbar">
            <div style={{ width: '100%', maxWidth: 600, flexShrink: 0 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <AppLogo size={64} className="animate-pulse-glow" style={{
                        borderRadius: 18,
                        boxShadow: '0 8px 32px rgba(124,92,255,0.35)',
                        marginBottom: 20,
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }} />
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Welcome to <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MarketingAI Studio</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        {workspaces.length > 0
                            ? 'Select a workspace to continue, or create a new one.'
                            : 'Create your first workspace to get started.'}
                    </p>
                </div>

                {/* Existing workspaces */}
                {workspaces.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <p style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12,
                        }}>Your Workspaces</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {workspaces.map(ws => (
                                <button
                                    key={ws.uuid}
                                    onClick={() => handleSelect(ws)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 18px', borderRadius: 12,
                                        border: '1.5px solid var(--border-default)',
                                        background: 'var(--bg-secondary)',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,255,0.06)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                                    }}
                                >
                                    <WorkspaceAvatar name={ws.name} size={40} borderRadius={10} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{ws.name}</p>
                                        {ws.description && (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ws.description}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight size={16} color="var(--text-muted)" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create new workspace */}
                {!creating ? (
                    <button
                        onClick={() => setCreating(true)}
                        style={{
                            width: '100%', padding: '14px',
                            border: '1.5px dashed var(--border-strong)',
                            borderRadius: 12, background: 'transparent',
                            color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 8, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                        }}
                    >
                        <Plus size={16} /> Create New Workspace
                    </button>
                ) : (
                    <div style={{
                        padding: 20, borderRadius: 12,
                        border: '1.5px solid var(--primary)',
                        background: 'rgba(124,92,255,0.05)',
                    }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>New Workspace</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input
                                autoFocus
                                className="input"
                                placeholder="Workspace name *"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                style={{ fontSize: 14 }}
                            />
                            <input
                                className="input"
                                placeholder="Description (optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                style={{ fontSize: 14 }}
                            />
                        </div>
                        {error && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 8 }}>{error}</p>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            <button
                                onClick={() => { setCreating(false); setName(''); setDescription(''); setError(''); }}
                                style={{
                                    flex: 1, padding: '10px', background: 'transparent',
                                    border: '1px solid var(--border-default)', borderRadius: 8,
                                    color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                style={{
                                    flex: 2, padding: '10px', background: 'var(--primary)',
                                    border: 'none', borderRadius: 8,
                                    color: 'white', fontSize: 13, fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                {loading ? 'Creating...' : <><Check size={14} /> Create & Continue</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
