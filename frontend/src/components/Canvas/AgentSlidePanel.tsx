/**
 * AgentSlidePanel — right-side slide-out panel attached to CanvasPanel.
 *
 * MODE: 'add'  → Agent Grid → pick → Form → Generate → Add to Canvas
 * MODE: 'view' → Show card content + Feedback → Regenerate → Update card
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Search, ChevronLeft, Sparkles, RefreshCw,
    MessageSquare, RotateCcw, CheckCircle, ArrowRight
, ClipboardList } from 'lucide-react';
import { AGENT_CATEGORIES } from '../../data/agents';
import { AgentForm } from '../Core/AgentForm';
import { marked } from 'marked';
import { BrandIdentityOutput } from '../Core/agents/BrandIdentityOutput';
import { SmartOutput } from '../Core/agents/SmartOutput';
import { useAppStore } from '../../store/appStore';
import { cardsApi, agentApi } from '../../services/api';

/* Helper: check if data has fields SmartOutput can render */
function hasStructuredFields(d: any): boolean {
    if (!d || typeof d !== 'object') return false;
    return !!(
        d.sections?.length || d.recommendations?.length || d.action_items?.length ||
        d.variations?.length || d.concepts?.length || d.scenes?.length ||
        d.keyword_opportunities?.length || d.suggested_keywords?.length ||
        d.keywords?.length || d.technical_fixes?.length || d.score != null
    );
}

/* ────────────────────────────────────────────────────────────── */
/* TYPES                                                          */
/* ────────────────────────────────────────────────────────────── */

export type PanelMode = 'closed' | 'pick' | 'form' | 'output' | 'view';

export interface AgentSlidePanelProps {
    mode: PanelMode;
    selectedCardId?: string | null;
    selectedCardData?: any;
    onClose: () => void;
    onCardAdded: () => void;
}

/* ────────────────────────────────────────────────────────── */
/* AGENT GRID PICKER                                          */
/* ────────────────────────────────────────────────────────── */

function AgentPicker({ onPick }: { onPick: (agentId: string, agentName: string, catColor: string) => void }) {
    const [search, setSearch] = useState('');

    const filtered = AGENT_CATEGORIES.map(cat => ({
        ...cat,
        agents: cat.agents.filter(a =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.desc.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.agents.length > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Search */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search agents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 34px',
                            borderRadius: 10, border: '1.5px solid var(--border-default)',
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            fontSize: 13, outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Agent grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {filtered.map(cat => (
                    <div key={cat.title} style={{ marginBottom: 24 }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: cat.color, marginBottom: 10, paddingLeft: 4
                        }}>
                            {cat.title}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {cat.agents.map(agent => (
                                <button
                                    key={agent.id}
                                    onClick={() => onPick(agent.id, agent.name, cat.color)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 12px', borderRadius: 10,
                                        border: '1px solid var(--border-default)',
                                        background: 'var(--bg-primary)',
                                        cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s',
                                        width: '100%',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = cat.color;
                                        e.currentTarget.style.background = `${cat.color}10`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-default)';
                                        e.currentTarget.style.background = 'var(--bg-primary)';
                                    }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                        background: `${cat.color}18`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: cat.color
                                    }}>
                                        <agent.icon size={15} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{agent.name}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.desc}</p>
                                    </div>
                                    <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* CARD VIEW / FEEDBACK                                       */
/* ────────────────────────────────────────────────────────── */

function CardViewer({
    cardData, cardId, onRegenerated
}: { cardData: any; cardId: string; onRegenerated: () => void }) {
    const { activeWorkspace, activeCampaign } = useAppStore();
    const [feedback, setFeedback] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const structuredData = cardData?.metadata?.structured_data;
    const savedFormInputs = cardData?.metadata?.form_inputs || {};
    const textContent = cardData?.current_version?.content || cardData?.text_preview || '';
    const agentUsed = cardData?.agent_used;
    const isBrandIdentity = agentUsed === 'brand_identity';

    const handleRegenerate = async () => {
        if (!activeWorkspace || !activeCampaign || !feedback.trim()) return;
        setRegenerating(true);
        setError(null);
        try {
            // Ask the agent to refine based on feedback
            const payload: any = {
                ...savedFormInputs,
                workspace_id: activeWorkspace.uuid,
                campaign_id: activeCampaign.id,
                previous_content: textContent,
                feedback,
                additional_instructions: `User feedback on previous version: ${feedback}`,
            };

            let newContent = '';
            if (isBrandIdentity && structuredData) {
                // Re-run brand identity with feedback
                payload.business_description = structuredData.brand_name || '';
                payload.industry = structuredData.industry || 'Other';
                const response = await agentApi.generateBrandIdentity(payload);
                newContent = JSON.stringify(response, null, 2);
                // Update card metadata
                await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, cardId, {
                    content: newContent,
                    metadata: { structured_data: response, form_inputs: payload, is_core: true }
                });
            } else {
                const response = await agentApi.generateCore(agentUsed || 'generic', payload);
                newContent = response.text_content || response.content || JSON.stringify(response);
                await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, cardId, {
                    content: newContent,
                    metadata: { structured_data: response, form_inputs: payload, is_core: true }
                });
            }

            setFeedback('');
            onRegenerated();
        } catch (err: any) {
            setError(err.message || 'Regeneration failed.');
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Content preview */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {isBrandIdentity && structuredData ? (
                    <BrandIdentityOutput data={structuredData} />
                ) : hasStructuredFields(structuredData) ? (
                    <SmartOutput data={structuredData} />
                ) : textContent ? (
                    <div
                        className="deckcard-md"
                        style={{
                            background: 'var(--bg-primary)', borderRadius: 10,
                            border: '1px solid var(--border-default)', padding: 20,
                            fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7,
                        }}
                        dangerouslySetInnerHTML={{ __html: marked.parse(textContent, { breaks: true }) as string }}
                    />
                ) : (
                    <div style={{
                        background: 'var(--bg-primary)', borderRadius: 10,
                        border: '1px solid var(--border-default)', padding: 20,
                        fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7,
                        textAlign: 'center',
                    }}>
                        No content preview available.
                    </div>
                )}
            </div>

            {/* Feedback Section */}
            <div style={{
                padding: '16px 20px', borderTop: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)',
            }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Give Feedback & Regenerate
                </p>
                <textarea
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="e.g. Make the tone more playful, use blue instead of purple, add a 5th value..."
                    style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        border: '1.5px solid var(--border-default)',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.5,
                    }}
                />
                {error && (
                    <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>⚠ {error}</p>
                )}
                <button
                    onClick={handleRegenerate}
                    disabled={!feedback.trim() || regenerating}
                    style={{
                        width: '100%', marginTop: 10, padding: '12px',
                        background: feedback.trim() && !regenerating ? 'var(--primary)' : 'var(--border-default)',
                        color: 'white', border: 'none', borderRadius: 10,
                        fontWeight: 700, fontSize: 13, cursor: feedback.trim() && !regenerating ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s',
                    }}
                >
                    {regenerating
                        ? <><RefreshCw size={15} className="animate-spin" /> Regenerating...</>
                        : <><RotateCcw size={15} /> Regenerate with Feedback</>
                    }
                </button>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* MAIN PANEL COMPONENT                                       */
/* ────────────────────────────────────────────────────────── */


function StatusBadge({ isDraft }: { isDraft: boolean }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isDraft ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)',
            color: isDraft ? '#f59e0b' : '#22c55e',
            border: `1px solid ${isDraft ? 'rgba(251,191,36,0.3)' : 'rgba(34,197,94,0.3)'}`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        }}>
            {isDraft ? <ClipboardList size={11} /> : <CheckCircle size={11} />}
            {isDraft ? 'DRAFT' : 'FINAL'}
        </span>
    );
}

export const AgentSlidePanel: React.FC<AgentSlidePanelProps> = ({
    mode, selectedCardId, selectedCardData, onClose, onCardAdded
}) => {
    const { activeWorkspace, activeCampaign } = useAppStore();

    // Internal panel navigation
    const [step, setStep] = useState<'pick' | 'form' | 'output'>('pick');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedAgentName, setSelectedAgentName] = useState('');
    const [selectedAgentColor, setSelectedAgentColor] = useState('var(--primary)');
    const [generatedOutput, setGeneratedOutput] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});

    // Reset when panel opens in 'pick' mode
    useEffect(() => {
        if (mode === 'pick') {
            setStep('pick');
            setSelectedAgentId(null);
            setGeneratedOutput(null);
        }
    }, [mode]);

    const handlePickAgent = (id: string, name: string, color: string) => {
        setSelectedAgentId(id);
        setSelectedAgentName(name);
        setSelectedAgentColor(color);
        setStep('form');
    };

    const handleGenerated = (output: any) => {
        setGeneratedOutput(output);
        setStep('output');
    };

    const handleSaveDraft = async () => {
        if (!activeWorkspace || !activeCampaign || !selectedAgentId || !currentFormData) return;
        setIsSaving(true);
        try {
            const agentDef = AGENT_CATEGORIES.flatMap(c => c.agents).find(a => a.id === selectedAgentId);
            
            // For drafts from the panel, we create a card with the form inputs
            // but no output content yet.
            const card = await cardsApi.create(activeWorkspace.uuid, activeCampaign.id, {
                card_type: 'custom',
                title: agentDef?.name || selectedAgentName,
                position: 0,
                agent_used: selectedAgentId,
                metadata: {
                    form_inputs: currentFormData,
                    is_core: true,
                }
            });

            await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, card.id, {
                content: `Initial draft for ${selectedAgentName}. Open to full editor to generate content.`,
                metadata: { form_inputs: currentFormData }
            });

            onCardAdded();
            onClose();

            // Reset for next use
            setStep('pick');
            setSelectedAgentId(null);
            setGeneratedOutput(null);
        } catch (err) {
            console.error('Failed to save draft', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToCanvas = async () => {
        if (!activeWorkspace || !activeCampaign || !selectedAgentId || !generatedOutput) return;
        setIsSaving(true);
        try {
            const agentDef = AGENT_CATEGORIES.flatMap(c => c.agents).find(a => a.id === selectedAgentId);

            // Build card content
            let cardContent = generatedOutput.text_content || generatedOutput.content || '';
            if (!cardContent && selectedAgentId === 'brand_identity') {
                const d = generatedOutput;
                cardContent = [
                    `# ${d.brand_name || 'Brand Identity'}`,
                    d.tagline_idea ? `*"${d.tagline_idea}"*` : '',
                    `**Personality:** ${d.brand_personality || ''}`,
                    `**Colors:** ${(d.colors || []).map((c: any) => `${c.name} (${c.hex})`).join(' · ')}`,
                    `**Fonts:** ${d.fonts ? `${d.fonts.heading} / ${d.fonts.body}` : ''}`,
                    `**Values:** ${(d.values || []).join(', ')}`,
                ].filter(Boolean).join('\n');
            }
            if (!cardContent) cardContent = JSON.stringify(generatedOutput, null, 2);

            const card = await cardsApi.create(activeWorkspace.uuid, activeCampaign.id, {
                card_type: 'custom',
                title: agentDef?.name || selectedAgentName,
                position: 0,
                agent_used: selectedAgentId,
                metadata: {
                    structured_data: generatedOutput,
                    is_core: true,
                    assets: generatedOutput.assets || [],
                }
            });

            await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, card.id, { content: cardContent });
            await cardsApi.finalize(activeWorkspace.uuid, activeCampaign.id, card.id);

            onCardAdded();
            onClose();

            // Reset for next use
            setStep('pick');
            setSelectedAgentId(null);
            setGeneratedOutput(null);
        } finally {
            setIsSaving(false);
        }
    };

    const isOpen = mode !== 'closed';
    const isViewMode = mode === 'view';

    /* ── HEADER TITLE ── */
    const headerTitle = isViewMode
        ? selectedCardData?.title || 'Card Details'
        : step === 'pick' ? 'Add Agent'
            : step === 'form' ? selectedAgentName
                : `${selectedAgentName} Output`;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        zIndex: 49,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 520,
                background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border-default)',
                zIndex: 50,
                display: 'flex', flexDirection: 'column',
                transform: isOpen ? 'translateX(0)' : 'translateX(105%)',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.3)' : 'none',
            }}>

                {/* ══ HEADER ══ */}
                <div style={{
                    padding: '18px 20px', borderBottom: '1px solid var(--border-default)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg-primary)', flexShrink: 0,
                }}>
                    {/* Back button (form/output steps) */}
                    {!isViewMode && step !== 'pick' && (
                        <button
                            onClick={() => setStep(step === 'output' ? 'form' : 'pick')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}

                    {/* Color dot for agent */}
                    {!isViewMode && step !== 'pick' && (
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: selectedAgentColor, flexShrink: 0 }} />
                    )}

                    <h2 style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        {headerTitle}
                        {(step === 'form' || step === 'output') && <StatusBadge isDraft={true} />}
                        {isViewMode && <StatusBadge isDraft={selectedCardData?.status !== 'final'} />}
                    </h2>

                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', transition: '0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ══ CONTENT ══ */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* VIEW MODE: Show card + feedback */}
                    {isViewMode && (
                        <CardViewer
                            cardData={selectedCardData}
                            cardId={selectedCardId!}
                            onRegenerated={() => { onCardAdded(); onClose(); }}
                        />
                    )}

                    {/* ADD MODE: Agent picker step */}
                    {!isViewMode && step === 'pick' && (
                        <AgentPicker onPick={handlePickAgent} />
                    )}

                    {/* ADD MODE: Form step */}
                    {!isViewMode && step === 'form' && selectedAgentId && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            <AgentForm
                                agentId={selectedAgentId}
                                onGenerate={handleGenerated}
                                setIsGenerating={setIsGenerating}
                                onFormDataChange={setCurrentFormData}
                                onSaveDraft={handleSaveDraft}
                            />
                        </div>
                    )}

                    {/* ADD MODE: Output step */}
                    {!isViewMode && step === 'output' && generatedOutput && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Output preview */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {selectedAgentId === 'brand_identity' ? (
                                    <BrandIdentityOutput
                                        data={generatedOutput}
                                        onSaveToWorkspace={handleAddToCanvas}
                                        isSaving={isSaving}
                                    />
                                ) : hasStructuredFields(generatedOutput?.structured_data || generatedOutput) ? (
                                    <div style={{ padding: 20 }}>
                                        <SmartOutput data={generatedOutput?.structured_data || generatedOutput} />
                                    </div>
                                ) : (
                                    <div style={{ padding: 20 }}>
                                        <div
                                            className="deckcard-md"
                                            style={{
                                                background: 'var(--bg-primary)', borderRadius: 10,
                                                border: '1px solid var(--border-default)', padding: 20,
                                                fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7,
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: marked.parse(
                                                    generatedOutput.text_content || generatedOutput.content || JSON.stringify(generatedOutput, null, 2),
                                                    { breaks: true }
                                                ) as string
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Add to Canvas footer (non-brand-identity agents) */}
                            {selectedAgentId !== 'brand_identity' && (
                                <div style={{
                                    padding: '16px 20px', borderTop: '1px solid var(--border-default)',
                                    background: 'var(--bg-secondary)', flexShrink: 0,
                                }}>
                                    <button
                                        onClick={handleAddToCanvas}
                                        disabled={isSaving}
                                        style={{
                                            width: '100%', padding: '13px',
                                            background: isSaving ? 'var(--border-default)' : 'var(--primary)',
                                            color: 'white', border: 'none', borderRadius: 10,
                                            fontWeight: 700, fontSize: 14, cursor: isSaving ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {isSaving
                                            ? <><RefreshCw size={16} className="animate-spin" /> Adding...</>
                                            : <><CheckCircle size={16} /> Add to Canvas</>
                                        }
                                    </button>
                                    <button
                                        onClick={() => setStep('form')}
                                        style={{
                                            width: '100%', marginTop: 8, padding: '10px',
                                            background: 'transparent', color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-default)', borderRadius: 10,
                                            fontSize: 13, cursor: 'pointer', fontWeight: 600,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        ← Modify & Regenerate
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generating spinner overlay on form */}
                    {!isViewMode && step === 'form' && isGenerating && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 16,
                            borderRadius: 0, zIndex: 10,
                        }}>
                            <RefreshCw size={36} color="var(--primary)" className="animate-spin" />
                            <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Agent is thinking...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
