/**
 * CanvasPanel — Canvas-first multi-agent workspace.
 *
 *  • ReactFlow fills its container — drag + scroll work
 *  • "Add Agent" button in top bar opens Agent Picker slide-out
 *  • Delete card via DeckCardNode → ConfirmDialog
 *  • Export to PNG / PDF via html2canvas + jsPDF
 *  • Workspace loading spinner guard
 *  • Card dimensions 720×560 for readability
 *  • Custom scrollbar & controls styling
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    useReactFlow,
    ReactFlowProvider,
    BackgroundVariant,
    Panel,
    ConnectionLineType,
} from '@xyflow/react';
import dagre from 'dagre';
import {
    Plus, Layout, Sparkles, RefreshCw,
    Download, Image as ImageIcon, FileText as FileTextIcon,
    Search, X, ChevronRight, Save, CheckCircle,
    Maximize2, Minimize2
} from 'lucide-react';
import { CanvasWatermark, AppLogo } from '../Icons';

import DeckCardNode, { DeckCardData } from './DeckCardNode';
import ConfirmDialog from '../ConfirmDialog';
import { useAppStore } from '../../store/appStore';
import { cardsApi, canvasApi } from '../../services/api';
import { AGENT_CATEGORIES } from '../../data/agents';

const nodeTypes = { deckCard: DeckCardNode };

/* ── Card dimensions for Dagre layout — must match DeckCardNode width ── */
const CARD_WIDTH = 720;
const CARD_HEIGHT = 560;

/* ── Dagre grid layout ── */
function getLayoutedElements(nodes: Node<DeckCardData>[], edges: Edge[]) {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', ranksep: 360, nodesep: 260 });
    nodes.forEach(n => g.setNode(n.id, { width: CARD_WIDTH, height: CARD_HEIGHT }));
    edges.forEach(e => g.setEdge(e.source, e.target));
    dagre.layout(g);
    return {
        nodes: nodes.map(n => {
            const p = g.node(n.id);
            return {
                ...n,
                position: { x: p.x - CARD_WIDTH / 2, y: p.y - CARD_HEIGHT / 2 },
                targetPosition: Position.Left,
                sourcePosition: Position.Right,
            };
        }),
        edges,
    };
}

/* ── Canvas-specific styles injected once ── */
const CANVAS_STYLE = `
/* Custom ReactFlow controls styling */
.react-flow .react-flow__controls {
    background: rgba(18,18,30,0.95) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
    overflow: hidden;
}
.react-flow .react-flow__controls-button {
    background: transparent !important;
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    fill: rgba(255,255,255,0.5) !important;
    width: 32px !important;
    height: 32px !important;
}
.react-flow .react-flow__controls-button:hover {
    background: rgba(124,92,255,0.15) !important;
    fill: rgba(255,255,255,0.9) !important;
}
.react-flow .react-flow__controls-button:last-child {
    border-bottom: none !important;
}

/* MiniMap styling */
.react-flow .react-flow__minimap {
    background: rgba(18,18,30,0.9) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
}

/* Edge styling (Glowing Spark Navy Blue) */
.react-flow .react-flow__edge-path {
    stroke: #0ea5e9 !important;
    stroke-width: 3.5 !important;
    filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.8)) drop-shadow(0 0 12px rgba(14, 165, 233, 0.4)) !important;
    stroke-linecap: round !important;
}
.react-flow .react-flow__edge.selected .react-flow__edge-path {
    stroke: #38bdf8 !important;
    stroke-width: 4.5 !important;
    filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.5)) !important;
}
.react-flow .react-flow__connection-path {
    stroke: #0ea5e9 !important;
    stroke-width: 3.5 !important;
    filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.8)) !important;
}

/* Selection box */
.react-flow .react-flow__selection {
    background: rgba(124,92,255,0.08) !important;
    border: 1px solid rgba(124,92,255,0.4) !important;
}
`;

let canvasStyleInjected = false;
function ensureCanvasStyle() {
    if (canvasStyleInjected) return;
    const s = document.createElement('style');
    s.textContent = CANVAS_STYLE;
    document.head.appendChild(s);
    canvasStyleInjected = true;
}

/* ────────────────────────────── */
/* Agent Picker slide-out panel  */
/* ────────────────────────────── */
function AgentPicker({ onPick, onClose }: {
    onPick: (id: string) => void;
    onClose: () => void;
}) {
    const [q, setQ] = useState('');

    const filtered = AGENT_CATEGORIES.map(c => ({
        ...c,
        agents: c.agents.filter(a =>
            a.name.toLowerCase().includes(q.toLowerCase()) ||
            a.desc?.toLowerCase().includes(q.toLowerCase())
        ),
    })).filter(c => c.agents.length > 0);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 90,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                }}
            />
            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460,
                zIndex: 91, display: 'flex', flexDirection: 'column',
                background: 'linear-gradient(180deg, rgba(18,18,30,0.99) 0%, rgba(12,12,22,0.99) 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '-16px 0 64px rgba(0,0,0,0.5)',
                animation: 'slideInRight 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 22px 16px',
                    background: 'rgba(10,10,18,0.9)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 11,
                        background: 'rgba(124,92,255,0.15)',
                        border: '1px solid rgba(124,92,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <AppLogo size={22} className="animate-pulse-glow" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Add AI Agent
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                            Pick an agent to generate content
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)', cursor: 'pointer', padding: 8, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color="var(--text-muted)"
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search agents..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px 10px 36px',
                                borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.08)',
                                background: 'rgba(10,10,18,0.8)', color: 'var(--text-primary)',
                                fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,92,255,0.4)'}
                            onBlur={e => (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>
                </div>

                {/* Agent list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 20px' }}>
                    {filtered.map(cat => (
                        <div key={cat.title} style={{ marginBottom: 24 }}>
                            <p style={{
                                fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.1em', color: cat.color,
                                margin: '0 0 10px 4px',
                            }}>
                                {cat.title}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {cat.agents.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => { onPick(agent.id); onClose(); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '11px 14px', width: '100%', textAlign: 'left',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: 11, cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = `${cat.color}50`;
                                            (e.currentTarget as HTMLElement).style.background = `${cat.color}0c`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                                        }}
                                    >
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                            background: `${cat.color}15`,
                                            border: `1px solid ${cat.color}25`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <agent.icon size={15} color={cat.color} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                                {agent.name}
                                            </p>
                                            <p style={{
                                                fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {agent.desc}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} color="var(--text-muted)" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ────────────────────────────── */
/* Inner canvas                  */
/* ────────────────────────────── */
function CanvasInner() {
    const {
        setCards, removeCard, activeWorkspace, activeCampaign,
        setCurrentView, setAgentEditor, workspaceLoading,
        setLastCardId, zenMode, toggleZenMode, setPostEditorView
    } = useAppStore();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<DeckCardData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ cardId: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingLayout, setIsSavingLayout] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { fitView } = useReactFlow();

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => { ensureCanvasStyle(); }, []);

    /* ── Open AgentEditorView ── */
    const openCardEditor = useCallback((cardId: string, agentUsed?: string) => {
        setPostEditorView('canvas');
        setAgentEditor(cardId, agentUsed ?? null);
        setCurrentView('agent-edit');
    }, [setAgentEditor, setCurrentView, setPostEditorView]);

    /* ── Delete card: show confirm dialog ── */
    const requestDeleteCard = useCallback((cardId: string, title: string) => {
        setDeleteDialog({ cardId, title });
    }, []);

    /* ── Delete card: confirmed ── */
    const confirmDeleteCard = useCallback(async () => {
        if (!deleteDialog || !activeWorkspace || !activeCampaign) return;
        setIsDeleting(true);
        try {
            await cardsApi.delete(activeWorkspace.uuid, activeCampaign.id, deleteDialog.cardId);
            removeCard(deleteDialog.cardId);
            setNodes(ns => ns.filter(n => n.id !== deleteDialog.cardId));
            setEdges(es => es.filter(e => e.source !== deleteDialog.cardId && e.target !== deleteDialog.cardId));
        } catch (err) {
            console.error('Delete card error', err);
        } finally {
            setIsDeleting(false);
            setDeleteDialog(null);
        }
    }, [deleteDialog, activeWorkspace?.uuid, activeCampaign?.id, removeCard]);

    /* ── Load cards + edges + layout ── */
    const loadCards = useCallback(async () => {
        if (!activeWorkspace || !activeCampaign) return;
        setIsLoading(true);
        try {
            // Load cards, edges, and layout in parallel
            const [raw, savedEdges, layoutData] = await Promise.all([
                cardsApi.list(activeWorkspace.uuid, activeCampaign.id),
                canvasApi.loadEdges(activeWorkspace.uuid, activeCampaign.id).catch(() => []),
                canvasApi.loadLayout(activeWorkspace.uuid, activeCampaign.id).catch(() => ({ positions: {} })),
            ]);

            const savedPositions = (layoutData as any).positions || {};
            const hasSavedLayout = Object.keys(savedPositions).length > 0;

            const rawNodes: Node<DeckCardData>[] = raw.map(c => {
                const output = c.metadata?.structured_data || {};
                const items: { type: 'image' | 'video'; url: string }[] = [];

                const getFileType = (url: string): 'image' | 'video' => {
                    const ext = url.split('.').pop()?.toLowerCase();
                    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video';
                    return 'image';
                };

                if (output.images && Array.isArray(output.images)) {
                    output.images.forEach((url: string) => items.push({ type: 'image', url }));
                }
                if (output.videos && Array.isArray(output.videos)) {
                    output.videos.forEach((url: string) => items.push({ type: 'video', url }));
                }
                if (output.media && Array.isArray(output.media)) {
                    output.media.forEach((m: any) => {
                        if (typeof m === 'string') items.push({ type: getFileType(m), url: m });
                        else if (m.url) items.push({ type: m.type || getFileType(m.url), url: m.url });
                    });
                }
                if (output.assets && Array.isArray(output.assets)) {
                    output.assets.forEach((asset: any) => {
                        if (asset.gcs_url) {
                            items.push({
                                type: asset.asset_type === 'video' ? 'video' : 'image',
                                url: asset.gcs_url
                            });
                        }
                    });
                }
                if (output.image_url) items.push({ type: 'image', url: output.image_url });
                if (output.video_url) items.push({ type: 'video', url: output.video_url });

                return {
                    id: c.id,
                    type: 'deckCard',
                    position: { x: 0, y: 0 }, // We will assign positions in the next loop based on layout strategy
                    data: {
                        id: c.id,
                        card_type: c.card_type ?? 'custom',
                        title: c.title ?? '',
                        status: c.status ?? 'draft',
                        agent_used: c.agent_used,
                        text_preview: c.current_version?.content ?? c.text_preview ?? '',
                        thumbnail_url: c.thumbnail_url,
                        mediaItems: items,
                        structured_data: output,
                        onOpen: openCardEditor,
                        onDelete: requestDeleteCard,
                    },
                };
            });

            if (hasSavedLayout) {
                // Use saved positions for existing nodes; dynamically place new ones
                let maxX = 0;
                let topY = 0;
                let existingNodeCount = 0;

                for (const pos of Object.values(savedPositions) as any[]) {
                    if (pos.x > maxX) maxX = pos.x;
                    if (existingNodeCount === 0 || pos.y < topY) topY = pos.y;
                    existingNodeCount++;
                }

                // If no nodes existed to grab a Y from, default safely
                if (existingNodeCount === 0) topY = 0;

                let nextNewX = existingNodeCount > 0 ? maxX + 720 : 0;

                const positionedNodes = rawNodes.map(node => {
                    const savedPos = (savedPositions as any)[node.id];
                    if (savedPos) {
                        return { ...node, position: { x: savedPos.x, y: savedPos.y } };
                    } else {
                        // This is a NEW node dropped onto a canvas that already has custom layout
                        const newPos = { x: nextNewX, y: topY };
                        nextNewX += 720;
                        return { ...node, position: newPos };
                    }
                });

                setCards(raw);
                setNodes(positionedNodes);
                setEdges(savedEdges.map((e: any) => ({ ...e, type: 'smoothstep', animated: true })));

                // Tell the backend to persist these new calculated positions instantly so a reload doesn't scramble them back to origin
                const positionsToSave: Record<string, { x: number; y: number }> = {};
                positionedNodes.forEach(n => { positionsToSave[n.id] = { x: n.position.x, y: n.position.y }; });
                canvasApi.saveLayout(activeWorkspace.uuid, activeCampaign.id, positionsToSave).catch(() => { });
            } else {
                // No saved layout — use Dagre auto-layout
                const { nodes: ln, edges: le } = getLayoutedElements(rawNodes, []);
                setCards(raw);
                setNodes(ln);
                setEdges([...le, ...savedEdges.map((e: any) => ({ ...e, type: 'smoothstep', animated: true }))]);
            }

            // Set lastCardId to the last card in the list (most recent)
            if (raw.length > 0) {
                setLastCardId(raw[raw.length - 1].id);
            }

            setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 120);
        } catch (err) {
            console.error('loadCards error', err);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace?.uuid, activeCampaign?.id, openCardEditor]);

    useEffect(() => {
        loadCards();
        const refresh = () => loadCards();
        window.addEventListener('refresh-canvas', refresh);
        return () => window.removeEventListener('refresh-canvas', refresh);
    }, [loadCards]);

    /* ── Re-layout ── */
    const handleRelayout = () => {
        const { nodes: ln, edges: le } = getLayoutedElements([...nodes], [...edges]);
        setNodes(ln);
        setEdges(le);
        setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 80);
    };

    /* ── Export ── */
    const runExport = async (format: 'png' | 'pdf') => {
        setShowExportMenu(false);
        fitView({ padding: 0.08, duration: 600 });
        await new Promise(r => setTimeout(r, 700));
        try {
            // @ts-ignore
            const { default: html2canvas } = await import('html2canvas');
            const el = document.querySelector('.react-flow') as HTMLElement;
            if (!el) return;
            const canvas = await html2canvas(el, {
                backgroundColor: '#0a0a14', scale: 2, useCORS: true, allowTaint: true,
                width: el.scrollWidth, height: el.scrollHeight,
                windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
            });
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `canvas-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else {
                // @ts-ignore
                const { jsPDF } = await import('jspdf');
                const w = canvas.width, h = canvas.height;
                const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'px', format: [w, h] });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
                pdf.save(`canvas-${Date.now()}.pdf`);
            }
        } catch (err) { console.error('Export error:', err); }
    };

    /* ── Agent picker → open editor ── */
    const handlePick = (agentId: string) => {
        setPostEditorView('canvas');
        setAgentEditor(null, agentId);
        setCurrentView('agent-edit');
    };

    /* ── Edge connect (persist to backend) ── */
    const onConnect = useCallback((p: Edge | Connection) => {
        const newEdges = addEdge({ ...p, type: 'smoothstep', animated: true }, edges);
        setEdges(newEdges);
        // Save edges to backend
        if (activeWorkspace && activeCampaign) {
            const edgeData = newEdges.map(e => ({ id: e.id, source: e.source, target: e.target }));
            canvasApi.saveEdges(activeWorkspace.uuid, activeCampaign.id, edgeData).catch(console.error);
        }
    }, [activeWorkspace, activeCampaign, edges, setEdges]);

    /* ── Save layout ── */
    const handleSaveLayout = useCallback(async () => {
        if (!activeWorkspace || !activeCampaign) return;
        setIsSavingLayout(true);
        try {
            const positions: Record<string, { x: number; y: number }> = {};
            nodes.forEach(n => { positions[n.id] = { x: n.position.x, y: n.position.y }; });
            await canvasApi.saveLayout(activeWorkspace.uuid, activeCampaign.id, positions);
            // Also save edges
            const edgeData = edges.map(e => ({ id: e.id, source: e.source, target: e.target }));
            await canvasApi.saveEdges(activeWorkspace.uuid, activeCampaign.id, edgeData);
            setToast({ message: `Layout saved — ${nodes.length} cards, ${edges.length} edges`, type: 'success' });
        } catch (err) {
            console.error('Save layout error', err);
            setToast({ message: 'Failed to save layout', type: 'error' });
        } finally {
            setIsSavingLayout(false);
        }
    }, [activeWorkspace?.uuid, activeCampaign?.id, nodes, edges]);

    /* ── Guard ── */
    if (workspaceLoading || !activeCampaign) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
                {workspaceLoading ? (
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        {/* Animated glow ring */}
                        <div style={{
                            position: 'relative', width: 80, height: 80,
                            margin: '0 auto 20px',
                        }}>
                            <div style={{
                                position: 'absolute', inset: -6,
                                borderRadius: '50%',
                                border: '2px solid transparent',
                                borderTopColor: '#7c5cff',
                                borderRightColor: 'rgba(124,92,255,0.3)',
                                animation: 'canvasLoaderSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                            }} />
                            <div style={{
                                position: 'absolute', inset: -3,
                                borderRadius: '50%',
                                border: '1.5px solid transparent',
                                borderBottomColor: '#9b7fff',
                                borderLeftColor: 'rgba(155,127,255,0.2)',
                                animation: 'canvasLoaderSpin 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
                            }} />
                            <div style={{
                                position: 'absolute', inset: 4,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
                                animation: 'canvasLoaderPulse 2s ease-in-out infinite',
                            }} />
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <AppLogo size={36} style={{ filter: 'drop-shadow(0 0 10px rgba(124,92,255,0.5))' }} />
                            </div>
                        </div>
                        <p style={{
                            fontSize: 15, fontWeight: 600, margin: '0 0 6px',
                            background: 'linear-gradient(90deg, #7c5cff, #9b7fff, #7c5cff)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'canvasLoaderText 2s linear infinite',
                        }}>
                            Loading workspace
                        </p>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 6 }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: '#7c5cff',
                                    animation: `canvasLoaderDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                        <style>{`
                            @keyframes canvasLoaderSpin { to { transform: rotate(360deg); } }
                            @keyframes canvasLoaderPulse { 0%, 100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.08); } }
                            @keyframes canvasLoaderText { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                            @keyframes canvasLoaderDot { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
                        `}</style>
                    </div>
                ) : (
                    <>
                        <Layout size={44} color="var(--text-muted)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>
                            No campaign loaded yet.
                        </p>
                    </>
                )}
            </div>
        );
    }

    const hasCards = nodes.length > 0;

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0a0a14' }}>

            {/* ══ TOP BAR ══ */}
            <div
                className="hide-scrollbar"
                style={{
                    flexShrink: 0, height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 16px', gap: 12,
                    background: 'rgba(13,13,22,0.97)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 10,
                    overflowX: 'auto'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <button
                        onClick={toggleZenMode}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: 10,
                            background: zenMode ? 'rgba(124,92,255,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${zenMode ? 'rgba(124,92,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: zenMode ? '#7c5cff' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        title={zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
                    >
                        {zenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(124, 92, 255, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(124, 92, 255, 0.3)',
                            boxShadow: '0 0 15px rgba(124, 92, 255, 0.2)',
                        }}>
                            <Sparkles size={18} color="#7c5cff" />
                        </div>
                        <span style={{
                            fontSize: 16,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap'
                        }}>
                            {activeCampaign.name === 'Default Studio' || activeCampaign.name === 'AI Canvas Studio' ? 'Creative Studio' : activeCampaign.name}
                        </span>
                    </div>
                    <span className="hide-on-mobile" style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(124,92,255,0.08)',
                        border: '1px solid rgba(124,92,255,0.2)',
                        color: 'rgba(124,92,255,0.8)', fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                        {nodes.length} card{nodes.length !== 1 ? 's' : ''}
                    </span>
                    {isLoading && <RefreshCw size={14} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />}
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Re-layout */}
                    {nodes.length > 1 && (
                        <button
                            onClick={handleRelayout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
                                color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                            }}
                        >
                            <RefreshCw size={13} /> Auto-layout
                        </button>
                    )}

                    {/* Save Layout */}
                    {hasCards && (
                        <button
                            onClick={handleSaveLayout}
                            disabled={isSavingLayout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
                                color: isSavingLayout ? 'rgba(124,92,255,0.8)' : 'rgba(255,255,255,0.6)',
                                fontSize: 12.5, fontWeight: 600, cursor: isSavingLayout ? 'default' : 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (!isSavingLayout) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        >
                            <Save size={13} /> {isSavingLayout ? 'Saving…' : 'Save Layout'}
                        </button>
                    )}

                    {/* Export */}
                    {hasCards && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowExportMenu(v => !v)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px', background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
                                    color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                            >
                                <Download size={13} /> Export
                            </button>
                            {showExportMenu && (
                                <>
                                    <div onClick={() => setShowExportMenu(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
                                    <div style={{
                                        position: 'absolute', top: '110%', right: 0, zIndex: 20,
                                        minWidth: 170, background: 'rgba(18,18,30,0.98)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, overflow: 'hidden',
                                        boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
                                    }}>
                                        {[
                                            { label: 'Export as PNG', icon: ImageIcon, action: () => runExport('png') },
                                            { label: 'Export as PDF', icon: FileTextIcon, action: () => runExport('pdf') },
                                        ].map(({ label, icon: Icon, action }) => (
                                            <button key={label} onClick={action} style={{
                                                width: '100%', padding: '12px 18px',
                                                display: 'flex', alignItems: 'center', gap: 11,
                                                background: 'none', border: 'none',
                                                color: 'rgba(255,255,255,0.75)', fontSize: 13.5, cursor: 'pointer',
                                                textAlign: 'left', transition: 'background 0.12s',
                                            }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,255,0.1)'}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                                            >
                                                <Icon size={15} /> {label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Add Agent button */}
                    <button
                        onClick={() => setShowPicker(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 18px', color: 'white',
                            background: 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)',
                            border: '1px solid rgba(124,92,255,0.4)',
                            borderRadius: 10, fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', transition: 'all 0.25s ease',
                            boxShadow: '0 4px 16px rgba(124,92,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                            letterSpacing: '0.2px',
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = 'translateY(-2px) scale(1.02)';
                            el.style.boxShadow = '0 8px 28px rgba(124,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)';
                            el.style.background = 'linear-gradient(135deg, #8b6aff 0%, #7c5cff 50%, #9b7fff 100%)';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = 'none';
                            el.style.boxShadow = '0 4px 16px rgba(124,92,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)';
                            el.style.background = 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)';
                        }}
                        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(0.98)'; }}
                        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                    >
                        <div style={{
                            width: 20, height: 20, borderRadius: 6,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Plus size={13} strokeWidth={3} />
                        </div>
                        Add Agent
                    </button>
                </div>
            </div>

            {/* ══ REACT FLOW CANVAS ══ */}
            <div style={{ flex: 1, position: 'relative' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={4}
                    panOnScroll
                    panOnDrag={true}
                    selectionOnDrag={false}
                    zoomOnScroll
                    zoomOnPinch
                    nodesDraggable
                    nodesConnectable
                    elementsSelectable
                    proOptions={{ hideAttribution: true }}
                    style={{ width: '100%', height: '100%' }}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                    }}
                    connectionLineStyle={{ stroke: '#0ea5e9', strokeWidth: 3.5, filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.8))' }}
                    connectionLineType={ConnectionLineType.SmoothStep}
                >
                    <Controls position="bottom-left"
                        style={{ marginLeft: 18, marginBottom: 18 }}
                        showInteractive={false}
                    />
                    <MiniMap
                        position="bottom-right"
                        style={{
                            marginRight: 18, marginBottom: 18,
                            width: 160, height: 100,
                        }}
                        nodeColor={() => 'rgba(124,92,255,0.45)'}
                        maskColor="rgba(10,10,20,0.75)"
                        pannable
                        zoomable
                    />
                    <Panel position="top-right" style={{
                        marginRight: 20,
                        marginTop: 10,
                        opacity: 0.6,
                        pointerEvents: 'none'
                    }}>
                        <CanvasWatermark />
                    </Panel>
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={40} size={1.5}
                        color="rgba(124,92,255,0.15)"
                        style={{ background: 'radial-gradient(circle at center, rgba(13,13,22,0.6) 0%, rgba(10,10,20,1) 100%)' }}
                    />

                    {/* Empty state */}
                    {!isLoading && !hasCards && (
                        <Panel position="top-center" style={{ marginTop: 120 }}>
                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 22,
                                    background: 'rgba(124,92,255,0.08)',
                                    border: '2px dashed rgba(124,92,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <AppLogo size={42} className="animate-pulse-glow" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.88)', margin: '0 0 10px' }}>
                                        Your Canvas is Empty
                                    </h2>
                                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 380, margin: 0, lineHeight: 1.7 }}>
                                        Add an AI agent, fill the form, generate content, and finalize it to see it appear here.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPicker(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '11px 28px', color: 'white',
                                        background: 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)',
                                        border: '1px solid rgba(124,92,255,0.4)',
                                        borderRadius: 12, fontWeight: 700, fontSize: 14,
                                        cursor: 'pointer', transition: 'all 0.25s ease',
                                        boxShadow: '0 4px 16px rgba(124,92,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                                        letterSpacing: '0.3px',
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'translateY(-2px) scale(1.03)';
                                        el.style.boxShadow = '0 8px 32px rgba(124,92,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
                                        el.style.background = 'linear-gradient(135deg, #8b6aff 0%, #7c5cff 50%, #9b7fff 100%)';
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'none';
                                        el.style.boxShadow = '0 4px 20px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
                                        el.style.background = 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)';
                                    }}
                                    onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(0.97)'; }}
                                    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)'; }}
                                >
                                    <div style={{
                                        width: 24, height: 24, borderRadius: 8,
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Plus size={15} strokeWidth={3} />
                                    </div>
                                    Add Your First Agent
                                </button>
                            </div>
                        </Panel>
                    )}
                </ReactFlow>
            </div>

            {/* ══ TOAST NOTIFICATION ══ */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 20px',
                    background: toast.type === 'success'
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.95))'
                        : 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))',
                    borderRadius: 12,
                    boxShadow: `0 8px 32px ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: 'white', fontSize: 13.5, fontWeight: 600,
                    animation: 'toastSlideIn 0.3s ease-out',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                }}>
                    {toast.type === 'success'
                        ? <CheckCircle size={16} />
                        : <X size={16} />
                    }
                    {toast.message}
                    <button
                        onClick={() => setToast(null)}
                        style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer', padding: 2, marginLeft: 4,
                        }}
                    >
                        <X size={14} />
                    </button>
                    <style>{`@keyframes toastSlideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                </div>
            )}

            {/* ══ AGENT PICKER ══ */}
            {showPicker && (
                <AgentPicker onPick={handlePick} onClose={() => setShowPicker(false)} />
            )}

            {/* ══ DELETE CONFIRM DIALOG ══ */}
            <ConfirmDialog
                isOpen={!!deleteDialog}
                title="Delete Card"
                message={`Are you sure you want to delete "${deleteDialog?.title ?? 'this card'}"? This will permanently remove the card and all its versions. This action cannot be undone.`}
                confirmLabel="Delete Card"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={confirmDeleteCard}
                onCancel={() => { if (!isDeleting) setDeleteDialog(null); }}
            />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ── Exported wrapper ── */
export default function CanvasPanel() {
    return (
        <ReactFlowProvider>
            <CanvasInner />
        </ReactFlowProvider>
    );
}
