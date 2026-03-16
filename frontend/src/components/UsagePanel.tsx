import React, { useEffect, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { analyticsApi } from '../services/api';
import { useAppStore } from '../store/appStore';
import { BarChart3, Clock, DollarSign, Cpu, FileText, X, RefreshCw, Activity, Zap, Database, Eye } from 'lucide-react';
import PanelHeader from './PanelHeader';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

/* ─── Types ─────────────────────────────────────────────────── */

interface UsageLog {
    id: string;
    created_at: string;
    agent_name: string;
    model_name: string;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
    prompt?: string;
    response?: string;
    latency_ms?: number;
}

/* ─── Styles ─────────────────────────────────────────────────── */

const GRID_THEME_OVERRIDE = `
  .ag-theme-quartz-dark {
    --ag-background-color: #0d0d16;
    --ag-header-background-color: rgba(255,255,255,0.03);
    --ag-odd-row-background-color: rgba(255,255,255,0.01);
    --ag-border-color: rgba(255,255,255,0.08);
    --ag-row-hover-color: rgba(124,92,255,0.08);
    --ag-selected-row-background-color: rgba(124,92,255,0.12);
    --ag-header-foreground-color: var(--text-secondary);
    --ag-foreground-color: var(--text-primary);
    --ag-font-family: var(--font-sans);
    --ag-font-size: 13px;
    --ag-grid-size: 8px;
    --ag-header-height: 48px;
    --ag-row-height: 52px;
    --ag-border-radius: 12px;
  }
  .ag-header-cell-label {
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 10px;
    color: var(--text-muted);
  }
  .ag-row {
     border-bottom-color: rgba(255,255,255,0.05) !important;
  }
  .ag-cell {
    display: flex;
    align-items: center;
  }
`;

export default function UsagePanel() {
    const activeWorkspace = useAppStore(s => s.activeWorkspace);
    const [logs, setLogs] = useState<UsageLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);

    useEffect(() => {
        loadLogs();
    }, [activeWorkspace?.uuid]);

    const loadLogs = async () => {
        if (!activeWorkspace?.uuid) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await analyticsApi.listLogs(activeWorkspace.uuid);
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load logs:', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'created_at',
            headerName: 'Timestamp',
            valueFormatter: params => new Date(params.value).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            sort: 'desc',
            flex: 1.2,
            minWidth: 160
        },
        { field: 'agent_name', headerName: 'Agent', filter: true, flex: 1, minWidth: 140 },
        { field: 'model_name', headerName: 'Model', filter: true, flex: 1.2, minWidth: 160 },
        { field: 'tokens_input', headerName: 'In', width: 80, type: 'numericColumn' },
        { field: 'tokens_output', headerName: 'Out Tokens', width: 110 },
        {
            field: 'latency_ms',
            headerName: 'Latency',
            width: 100,
            valueFormatter: (params: any) => params.value ? `${(params.value / 1000).toFixed(2)}s` : '0.00s'
        },
        {
            field: 'cost_usd',
            headerName: 'Cost ($)',
            valueFormatter: (params: any) => `$${params.value.toFixed(4)}`,
            width: 110,
            type: 'numericColumn',
            cellStyle: { color: 'var(--accent-1)', fontWeight: '600' }
        },
        {
            headerName: 'Actions',
            cellRenderer: () => (
                <div
                    style={{
                        background: 'rgba(124,92,255,0.08)',
                        border: '1px solid rgba(124,92,255,0.15)',
                        borderRadius: 8, padding: '6px 14px',
                        color: 'var(--accent-1)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                        height: '32px', width: 'fit-content'
                    }}
                >
                    <Eye size={14} />
                    <span>View</span>
                </div>
            ),
            width: 120,
            pinned: 'right',
            sortable: false,
            filter: false,
            suppressMenu: true
        }
    ], []);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', overflowY: 'auto' }} className="custom-scrollbar">
            <style>{GRID_THEME_OVERRIDE}</style>
            {/* ══ HEADER ══ */}
            <div className="mobile-padding" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-stack">
                    <PanelHeader
                        title="AI Usage"
                        Icon={FileText}
                        subtitle={(
                            <>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Database size={13} color="var(--accent-1)" /> log history</span>
                                <span style={{ opacity: 0.3 }} className="hide-on-mobile">•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={13} color="var(--accent-2)" /> real-time activity</span>
                            </>
                        )}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="mobile-stack">
                        <button
                            onClick={loadLogs}
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                                borderRadius: 10, color: 'var(--text-primary)', fontSize: 13,
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-1)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="mobile-padding" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    <MetricBox icon={Activity} label="Total Calls" value={(logs?.length || 0).toString()} color="var(--accent-1)" />
                    <MetricBox icon={DollarSign} label="Total Spend" value={`$${(logs || []).reduce((acc, l) => acc + (l.cost_usd || 0), 0).toFixed(4)}`} color="var(--accent-2)" />
                    <MetricBox icon={Cpu} label="Avg Latency" value={`${((logs || []).reduce((acc, l) => acc + (l.latency_ms || 0), 0) / (logs?.length || 1) / 1000).toFixed(2)}s`} color="var(--accent-3)" />
                </div>

                {/* Table */}
                <div style={{ flex: 1, minHeight: 400, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }} className="ag-theme-quartz-dark">
                    {logs.length === 0 && !loading && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 10,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-primary)', opacity: 0.95
                        }}>
                            <BarChart3 size={48} color="var(--text-muted)" style={{ marginBottom: 20, opacity: 0.3 }} />
                            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 18 }}>No usage logs yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                                Generation history will appear here once you interact with agents.
                            </p>
                        </div>
                    )}
                    <AgGridReact
                        rowData={logs}
                        columnDefs={columnDefs}
                        onCellClicked={(params) => {
                            if (params.colDef.headerName === 'Actions') {
                                setSelectedLog(params.data);
                            }
                        }}
                        defaultColDef={{
                            resizable: true,
                            sortable: true,
                            filter: true,
                        }}
                        pagination={true}
                        paginationPageSize={20}
                        animateRows={true}
                        headerHeight={48}
                        rowHeight={52}
                    />
                </div>
            </div>

            {selectedLog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 40
                }} onClick={() => setSelectedLog(null)}>
                    <div className="animate-fade-in" style={{
                        width: '100%', maxWidth: 900, maxHeight: '90vh',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                        borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.6)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            padding: '24px 32px', borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Request Details</h3>
                                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                                    {selectedLog.id} • {new Date(selectedLog.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
                                    cursor: 'pointer', padding: 10, borderRadius: 12, transition: '0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }} className="custom-scrollbar">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                                <MetricBox icon={<Cpu size={14} />} label="Model" value={selectedLog.model_name} />
                                <MetricBox icon={<Clock size={14} />} label="Agent" value={selectedLog.agent_name} />
                                <MetricBox icon={<Activity size={14} />} label="Total Tokens" value={(selectedLog.tokens_input + selectedLog.tokens_output).toString()} />
                                <MetricBox icon={<Zap size={14} />} label="Latency" value={`${((selectedLog.latency_ms || 0) / 1000).toFixed(2)}s`} highlight />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                                        <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Prompt</h4>
                                    </div>
                                    <pre style={{
                                        margin: 0, padding: 20, background: 'rgba(255,255,255,0.02)',
                                        borderRadius: 16, border: '1px solid var(--border-default)',
                                        fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.8)',
                                        fontFamily: 'var(--font-mono)', minHeight: 60
                                    }}>
                                        {selectedLog.prompt || 'No prompt recorded.'}
                                    </pre>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-1)' }} />
                                        <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Response</h4>
                                    </div>
                                    <pre style={{
                                        margin: 0, padding: 20, background: 'rgba(124,92,255,0.03)',
                                        borderRadius: 16, border: '1px solid rgba(124,92,255,0.15)',
                                        fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-mono)', minHeight: 100
                                    }}>
                                        {selectedLog.response || 'No response recorded.'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricBox({ icon: Icon, label, value, highlight = false, color }: any) {
    const iconColor = color || (highlight ? 'var(--accent-1)' : 'var(--text-muted)');

    const renderIcon = () => {
        if (!Icon) return null;

        // 1. Check if it's a pre-rendered element (e.g. <Cpu size={14} />)
        if (React.isValidElement(Icon)) {
            return React.cloneElement(Icon as React.ReactElement, {
                size: 14,
                color: iconColor
            } as any);
        }

        // 2. Check if it's a component class or functional component (e.g. Cpu)
        if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.render)) {
            const IconComp = Icon;
            return <IconComp size={14} color={iconColor} />;
        }

        return null;
    };

    return (
        <div style={{
            padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-default)',
            transition: '0.2s',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 8 }}>
                {renderIcon()}
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: highlight ? 'var(--accent-1)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value}
            </div>
        </div>
    );
}
