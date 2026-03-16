/**
 * MyAgentsView — Dashboard of all agent runs across all campaigns.
 * Shows Draft and Finalized cards. Click = open AgentEditorView.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    Bot, Clock, CheckCircle, Search, RefreshCw,
    Plus, Grid, ChevronDown, ChevronRight, X, Trash2
} from 'lucide-react';
import { AppLogo } from './Icons';
import { useAppStore } from '../store/appStore';
import { cardsApi } from '../services/api';
import { AGENT_CATEGORIES } from '../data/agents';
import PanelHeader from './PanelHeader';
import ConfirmDialog from './ConfirmDialog';

type FilterType = 'all' | 'draft' | 'final';

function AgentRunCard({ card, onOpen, onDelete }: { card: any; onOpen: () => void; onDelete: (e: React.MouseEvent) => void }) {
    const isFinal = card.status === 'final';
    const agentDef = AGENT_CATEGORIES.flatMap(c => c.agents).find(a => a.id === card.agent_used);
    const catColor = AGENT_CATEGORIES.find(c => c.agents.some(a => a.id === card.agent_used))?.color || 'var(--primary)';
    const preview = card.current_version?.content?.slice(0, 100) || card.text_preview?.slice(0, 100) || '';
    const date = card.created_at ? new Date(card.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div
            onClick={onOpen}
            style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = catColor;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.15)`;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
        >
            <div style={{ height: 4, background: catColor, width: '100%' }} />
            <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: `${catColor}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {agentDef ? <agentDef.icon size={16} color={catColor} /> : <Bot size={16} color={catColor} />}
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                {card.title || agentDef?.name || card.agent_used?.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                {agentDef?.name || card.agent_used?.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: isFinal ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)',
                        color: isFinal ? '#22c55e' : '#f59e0b',
                        border: `1px solid ${isFinal ? 'rgba(34,197,94,0.25)' : 'rgba(251,191,36,0.25)'}`,
                        flexShrink: 0,
                    }}>
                        {isFinal ? <CheckCircle size={9} /> : <Clock size={9} />}
                        {isFinal ? 'Final' : ''}
                    </span>
                    <button
                        onClick={onDelete}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
                {preview ? (
                    <p style={{
                        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                        margin: '0 0 12px', height: 38, overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                        {preview}
                    </p>
                ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', fontStyle: 'italic' }}>
                        No preview available
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>
                    <span style={{ fontSize: 11, color: catColor, fontWeight: 700 }}>
                        Open →
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function MyAgentsView() {
    const { activeWorkspace, activeCampaign, setCurrentView, setAgentEditor, setPostEditorView } = useAppStore();
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [showAgentPicker, setShowAgentPicker] = useState(false);
    const [agentSearch, setAgentSearch] = useState('');
    const [selectedCardIdForDelete, setSelectedCardIdForDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const loadAllCards = async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        try {
            const allCards = activeCampaign?.id
                ? await cardsApi.list(activeWorkspace.uuid, activeCampaign.id)
                : await cardsApi.listAll(activeWorkspace.uuid);
            setCards(Array.isArray(allCards) ? allCards : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAllCards(); }, [activeWorkspace?.uuid, activeCampaign?.id]);

    useEffect(() => {
        const handleRefresh = () => loadAllCards();
        window.addEventListener('refresh-canvas', handleRefresh);
        return () => window.removeEventListener('refresh-canvas', handleRefresh);
    }, []);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowAgentPicker(false);
            }
        };
        if (showAgentPicker) document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [showAgentPicker]);

    const handleOpen = (card: any) => {
        setPostEditorView('my-agents');
        setAgentEditor(card.id, card.agent_used);
        setCurrentView('agent-edit');
    };

    const handlePickAgent = (agentId: string) => {
        setShowAgentPicker(false);
        setPostEditorView('my-agents');
        setAgentEditor(null, agentId);
        setCurrentView('agent-edit');
    };

    const handleDeleteCard = async () => {
        if (!activeWorkspace || !activeCampaign || !selectedCardIdForDelete) return;
        setIsDeleting(true);
        try {
            await cardsApi.delete(activeWorkspace.uuid, activeCampaign.id, selectedCardIdForDelete);
            setCards(cards.filter(c => c.id !== selectedCardIdForDelete));
            setSelectedCardIdForDelete(null);
            // Sync with canvas if it's open
            window.dispatchEvent(new Event('refresh-canvas'));
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = cards.filter(card => {
        if (filter === 'draft' && card.status === 'final') return false;
        if (filter === 'final' && card.status !== 'final') return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                card.title?.toLowerCase().includes(q) ||
                card.agent_used?.replace(/_/g, ' ').toLowerCase().includes(q) ||
                card.current_version?.content?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const allAgents = AGENT_CATEGORIES.flatMap(c =>
        c.agents.map(a => ({ ...a, catColor: c.color, catLabel: c.title }))
    );
    const filteredAgents = agentSearch
        ? allAgents.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
        : allAgents;

    const draftCount = cards.filter(c => c.status !== 'final').length;
    const finalCount = cards.filter(c => c.status === 'final').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', overflowY: 'auto' }} className="custom-scrollbar">
            {/* ══ HEADER ══ */}
            <div className="mobile-padding" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }} className="mobile-stack">
                    <PanelHeader
                        title="My Agents"
                        Icon={Bot}
                        subtitle={
                            <>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Grid size={13} /> {cards.length} runs
                                </span>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={13} /> {draftCount} drafts
                                </span>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle size={13} color="#22c55e" /> {finalCount} finalized
                                </span>
                            </>
                        }
                    />
                    <div style={{ position: 'relative', flexShrink: 0 }} ref={pickerRef}>
                        <button
                            onClick={() => setShowAgentPicker(!showAgentPicker)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 20px', color: 'white',
                                background: 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)',
                                border: '1px solid rgba(124,92,255,0.4)',
                                borderRadius: 12, fontWeight: 700, fontSize: 13.5,
                                cursor: 'pointer', transition: 'all 0.25s ease',
                                boxShadow: '0 4px 16px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                                letterSpacing: '0.2px',
                                height: 'fit-content'
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
                                el.style.boxShadow = '0 4px 16px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
                                el.style.background = 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)';
                            }}
                            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(0.98)'; }}
                            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                        >
                            <div style={{
                                width: 22, height: 22, borderRadius: 7,
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Plus size={14} strokeWidth={3} />
                            </div>
                            Add Agent
                            <ChevronDown size={14} style={{ transform: showAgentPicker ? 'rotate(180deg)' : 'none', transition: '0.2s', marginLeft: 'auto' }} />
                        </button>

                        {showAgentPicker && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: 10,
                                width: 300, background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-accent)',
                                borderRadius: 12, overflow: 'hidden', zIndex: 100,
                                boxShadow: 'var(--shadow-lg)',
                            }}>
                                <div style={{ padding: 12, borderBottom: '1px solid var(--border-default)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)', padding: '6px 10px', borderRadius: 8 }}>
                                        <Search size={14} color="var(--text-muted)" />
                                        <input
                                            placeholder="Search..."
                                            value={agentSearch}
                                            onChange={e => setAgentSearch(e.target.value)}
                                            style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13, width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {filteredAgents.map(agent => (
                                        <div
                                            key={agent.id}
                                            onClick={() => handlePickAgent(agent.id)}
                                            style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-default)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <agent.icon size={16} color={agent.catColor} />
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ CONTENT ══ */}
            <div className="mobile-padding" style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }} className="mobile-stack">
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search runs..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input"
                            style={{ paddingLeft: 34 }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['all', 'draft', 'final'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '6px 12px', borderRadius: 8,
                                    border: `1px solid ${filter === f ? 'var(--accent-1)' : 'var(--border-default)'}`,
                                    background: filter === f ? 'rgba(124,92,255,0.1)' : 'transparent',
                                    color: filter === f ? 'var(--accent-1)' : 'var(--text-secondary)',
                                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                        <RefreshCw size={24} color="var(--primary)" className="animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <AppLogo size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <p>{search ? 'No results found.' : 'No agent runs yet.'}</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 20,
                    }}>
                        {filtered.map(card => (
                            <AgentRunCard
                                key={card.id}
                                card={card}
                                onOpen={() => handleOpen(card)}
                                onDelete={(e) => {
                                    e.stopPropagation();
                                    setSelectedCardIdForDelete(card.id);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!selectedCardIdForDelete}
                title="Delete Agent Card"
                message="Are you sure you want to delete this agent card? This will remove it from both your agents list and the canvas. This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDeleteCard}
                onCancel={() => setSelectedCardIdForDelete(null)}
            />
        </div>
    );
}
