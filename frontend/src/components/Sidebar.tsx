/** Sidebar — workspace & campaign navigation. */

import React, { useEffect, useState } from 'react';
import {
    Sparkles, Plus, ChevronDown, Image, Settings,
    FolderOpen, LayoutGrid, LogOut, Bot, BarChart2, Trash2,
    ChevronsLeft, ChevronsRight, Layout, BookOpen, Activity,
    Compass, User, Database
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { workspaceApi, campaignApi } from '../services/api';
import { AppLogo } from './Icons';
import { WorkspaceAvatar } from './WorkspaceAvatar';
import ConfirmDialog from './ConfirmDialog';

const SidebarSectionHeader = ({ icon: Icon, label, expanded, onToggle, collapsable = true, sidebarCollapsed }: any) => (
    <div style={{ padding: '24px 16px 8px' }}>
        <button
            onClick={collapsable ? onToggle : undefined}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: collapsable ? 'pointer' : 'default', padding: '4px 0',
                transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => collapsable && (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => collapsable && (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} strokeWidth={2.5} />
                <span className="sidebar-label">{label}</span>
            </span>
            {!sidebarCollapsed && collapsable && (
                <ChevronDown size={14} style={{ transform: expanded ? 'none' : 'rotate(-90deg)', transition: '0.2s', opacity: 0.5 }} />
            )}
        </button>
    </div>
);

export default function Sidebar() {
    const {
        workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace,
        campaigns, activeCampaign, setCampaigns, setActiveCampaign,
        currentView, setCurrentView, clearAuth, sidebarOpen, toggleSidebar,
        sidebarCollapsed, toggleSidebarCollapsed, cards,
        setWorkspaceLoading,
    } = useAppStore();
    const [wsExpanded, setWsExpanded] = useState(true);
    const [creating, setCreating] = useState<'workspace' | 'campaign' | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'default';
        onConfirm: () => void;
    } | null>(null);

    // Load workspaces — never auto-select (WorkspaceGate handles that)
    useEffect(() => {
        workspaceApi.list().then(list => {
            setWorkspaces(Array.isArray(list) ? list : []);
        }).catch(() => { });
    }, []);

    // Load campaigns when workspace changes — with stale-request guard
    useEffect(() => {
        if (!activeWorkspace) return;
        let stale = false;
        const wsUuid = activeWorkspace.uuid;
        setWorkspaceLoading(true);

        campaignApi.list(wsUuid).then(async list => {
            if (stale) return;
            const camps = Array.isArray(list) ? list : [];
            if (camps.length === 0) {
                try {
                    const defaultCamp = await campaignApi.create(wsUuid, { name: 'Creative Studio ✨' });
                    if (stale) return;
                    setCampaigns([defaultCamp]);
                    setActiveCampaign(defaultCamp);
                } catch (e) { console.error("Failed to create default campaign", e); }
            } else {
                setCampaigns(camps);
                if (!activeCampaign || !camps.find(c => c.id === activeCampaign.id)) {
                    setActiveCampaign(camps[0]);
                }
            }
        }).catch(() => { }).finally(() => {
            if (!stale) setWorkspaceLoading(false);
        });

        return () => { stale = true; };
    }, [activeWorkspace?.uuid]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            if (creating === 'workspace') {
                const ws = await workspaceApi.create({ name: newName, description: newDescription });
                setWorkspaces([ws, ...workspaces]);
                setActiveWorkspace(ws);
            }
        } catch { }
        setCreating(null);
        setNewName('');
        setNewDescription('');
    };

    const handleDeleteWorkspace = async (e: React.MouseEvent, uuid: string, name: string) => {
        e.stopPropagation();
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Workspace',
            message: `Are you sure you want to delete the workspace "${name}"? This action cannot be undone and will delete all associated campaigns.`,
            onConfirm: async () => {
                try {
                    await workspaceApi.delete(uuid);
                    const remaining = workspaces.filter(w => w.uuid !== uuid);
                    setWorkspaces(remaining);
                    if (activeWorkspace?.uuid === uuid) {
                        setActiveWorkspace(remaining.length > 0 ? remaining[0] : null);
                    }
                } catch (err) {
                    console.error('Failed to delete workspace', err);
                }
                setConfirmDialog(null);
            }
        });
    };

    const navItems = [
        { id: 'canvas' as const, label: 'Creative Studio', icon: Sparkles },
        { id: 'my-agents' as const, label: 'My Agents', icon: Bot },
        { id: 'prompt-library' as const, label: 'Prompts', icon: BookOpen },
        { id: 'knowledge-base' as const, label: 'Knowledge Base', icon: Database },
        { id: 'usage' as const, label: 'Usage', icon: Activity },
        { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
        { id: 'assets' as const, label: 'Assets Library', icon: Image },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="sidebar-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AppLogo size={34} />
                    <div className="sidebar-text">
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>MarketingAI <span className="gradient-text">Studio</span></h2>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-native marketing OS</p>
                    </div>
                </div>

                <button
                    onClick={toggleSidebarCollapsed}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: '4px', borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="custom-scrollbar">

                {/* Workspace Selector */}
                <SidebarSectionHeader
                    icon={FolderOpen}
                    label="Workspaces"
                    expanded={wsExpanded}
                    onToggle={() => setWsExpanded(!wsExpanded)}
                    sidebarCollapsed={sidebarCollapsed}
                />

                <div style={{ padding: '0 16px 12px' }}>

                    {wsExpanded && (
                        <div style={{ marginTop: 6 }}>
                            {(workspaces || []).map(ws => (
                                <div key={ws.uuid} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
                                    <button onClick={() => {
                                        setActiveWorkspace(ws);
                                        if (cards.length > 0) setCurrentView('canvas');
                                    }} style={{
                                        display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '8px 10px',
                                        background: activeWorkspace?.uuid === ws.uuid ? 'var(--gradient-subtle)' : 'transparent',
                                        border: activeWorkspace?.uuid === ws.uuid ? '1px solid rgba(124,92,255,0.2)' : '1px solid transparent',
                                        borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)',
                                        fontSize: 13, fontWeight: 500, textAlign: 'left', transition: '0.15s',
                                        overflow: 'hidden'
                                    }}>
                                        <WorkspaceAvatar name={ws.name} size={18} borderRadius={4} fontSize={10} />
                                        <span className="sidebar-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                                    </button>
                                    {!sidebarCollapsed && (
                                        <button
                                            onClick={(e) => handleDeleteWorkspace(e, ws.uuid, ws.name)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '6px', borderRadius: '4px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--text-muted)', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            title="Delete workspace"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setCreating('workspace')} style={{
                                display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 10px',
                                background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12,
                                cursor: 'pointer', marginTop: 4,
                            }}>
                                <Plus size={14} /> <span className="sidebar-label">New workspace</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <SidebarSectionHeader
                    icon={Compass}
                    label="Navigation"
                    collapsable={false}
                    sidebarCollapsed={sidebarCollapsed}
                />
                <div style={{ padding: '0 16px 12px' }}>
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => {
                            setCurrentView(item.id);
                            if (window.innerWidth <= 768 && sidebarOpen) toggleSidebar();
                        }} style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px',
                            background: currentView === item.id ? 'rgba(124,92,255,0.08)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            color: currentView === item.id ? 'var(--accent-1)' : 'var(--text-secondary)',
                            fontSize: 13, fontWeight: 500, transition: '0.15s', textAlign: 'left',
                        }}>
                            <item.icon size={16} style={{ flexShrink: 0 }} />
                            <span className="sidebar-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Logout Section */}
            <SidebarSectionHeader
                icon={User}
                label="Account"
                collapsable={false}
                sidebarCollapsed={sidebarCollapsed}
            />
            <div style={{ padding: '0 20px 20px', marginTop: 'auto' }}>
                <button
                    onClick={() => setConfirmDialog({
                        isOpen: true,
                        title: 'Sign Out',
                        message: 'Are you sure you want to sign out?',
                        confirmLabel: 'Sign Out',
                        variant: 'danger',
                        onConfirm: () => {
                            clearAuth();
                            setConfirmDialog(null);
                        }
                    })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-500/80 hover:text-red-500 font-semibold text-[13px] transition-all duration-300 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <LogOut size={16} className={`${!sidebarCollapsed ? 'group-hover:-translate-x-1' : ''} transition-transform duration-300 flex-shrink-0`} />
                    <span className="tracking-wide sidebar-label">Sign Out</span>
                </button>
            </div>

            {/* Modals & Dialogs */}
            {
                creating && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 100,
                    }} onClick={() => setCreating(null)}>
                        <div className="animate-fade-in" onClick={e => e.stopPropagation()} style={{
                            background: 'var(--bg-secondary)', padding: 28, borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-default)', width: 380,
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>New Workspace</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input className="input" placeholder="Workspace Name" value={newName}
                                    onChange={e => setNewName(e.target.value)} autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                />
                                <textarea
                                    className="input"
                                    placeholder="Description (Optional)"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCreate();
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                                <button className="btn-secondary" onClick={() => setCreating(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleCreate}>Create</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {confirmDialog && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmLabel={confirmDialog.confirmLabel}
                    variant={confirmDialog.variant}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div >
    );
}
