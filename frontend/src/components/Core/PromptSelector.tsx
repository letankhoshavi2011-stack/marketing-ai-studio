/**
 * PromptSelector — select a prompt from the library or create a custom one.
 * Shows dropdown of available prompts, preview, variable chips, create/edit modal.
 */

import React, { useState, useEffect } from 'react';
import {
    BookOpen, ChevronDown, Eye, Plus, X, Save,
    Sparkles, Code2, RefreshCw, Edit3, Trash2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { promptApi } from '../../services/api';

interface PromptSelectorProps {
    agentId: string;
    category?: string; // NEW: Pass the agent category
    selectedPromptId: string | null;
    onSelect: (promptId: string | null) => void;
}

export default function PromptSelector({ agentId, category, selectedPromptId, onSelect }: PromptSelectorProps) {
    const { activeWorkspace } = useAppStore();
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<any>(null);

    const selectedPrompt = prompts.find(p => p.prompt_id === selectedPromptId);

    useEffect(() => {
        if (activeWorkspace) loadPrompts();
    }, [activeWorkspace?.uuid, agentId]);

    const loadPrompts = async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        try {
            const list = await promptApi.list(activeWorkspace.uuid, agentId);
            setPrompts(Array.isArray(list) ? list : []);
        } catch {
            setPrompts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (promptId: string | null) => {
        onSelect(promptId);
        setExpanded(false);
    };

    const handleCreate = () => {
        setEditingPrompt(null);
        setShowModal(true);
    };

    const handleEdit = (prompt: any) => {
        setEditingPrompt(prompt);
        setShowModal(true);
    };

    const handleModalSave = async (data: any) => {
        if (!activeWorkspace) return;
        try {
            if (editingPrompt) {
                await promptApi.update(activeWorkspace.uuid, editingPrompt.prompt_id, data);
            } else {
                const created = await promptApi.create(activeWorkspace.uuid, {
                    ...data,
                    agent_id: agentId,
                    category: category || 'general',
                });
                onSelect(created.prompt_id);
            }
            await loadPrompts();
            setShowModal(false);
        } catch (err: any) {
            alert(err.message || 'Failed to save prompt');
        }
    };

    const handleDelete = async (promptId: string) => {
        if (!activeWorkspace) return;
        try {
            await promptApi.delete(activeWorkspace.uuid, promptId);
            if (selectedPromptId === promptId) onSelect(null);
            await loadPrompts();
        } catch (err: any) {
            alert(err.message || 'Cannot delete this prompt');
        }
    };

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{
                marginBottom: 10, paddingLeft: 12,
                borderLeft: '3px solid #7c5cff',
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <BookOpen size={13} color="#7c5cff" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Prompts Hub
                </span>
            </div>

            {/* Dropdown trigger */}
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border-default)',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--primary)" />
                        {loading ? 'Loading...' : selectedPrompt
                            ? selectedPrompt.name
                            : 'Default Prompt (built-in)'}
                    </span>
                    <ChevronDown size={14} color="var(--text-muted)" style={{
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                    }} />
                </button>

                {/* Dropdown */}
                {expanded && (
                    <>
                        <div onClick={() => setExpanded(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
                        <div style={{
                            position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 51,
                            background: 'rgba(18,18,30,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12, overflow: 'hidden', maxHeight: 300, overflowY: 'auto',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        }}>
                            {/* Default option */}
                            <button
                                type="button"
                                onClick={() => handleSelect(null)}
                                style={{
                                    width: '100%', padding: '10px 14px', textAlign: 'left',
                                    background: !selectedPromptId ? 'rgba(124,92,255,0.1)' : 'transparent',
                                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}
                            >
                                <Sparkles size={13} color="var(--text-muted)" />
                                Default Prompt (built-in)
                            </button>

                            {prompts.map(p => (
                                <div key={p.prompt_id} style={{
                                    display: 'flex', alignItems: 'center',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(p.prompt_id)}
                                        style={{
                                            flex: 1, padding: '10px 14px', textAlign: 'left',
                                            background: selectedPromptId === p.prompt_id ? 'rgba(124,92,255,0.1)' : 'transparent',
                                            border: 'none', color: 'var(--text-primary)',
                                            fontSize: 13, cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>{p.name}</span>
                                            {p.is_default && (
                                                <span style={{
                                                    fontSize: 9, padding: '1px 6px', borderRadius: 8,
                                                    background: 'rgba(124,92,255,0.15)', color: 'var(--primary)',
                                                    fontWeight: 700,
                                                }}>SYSTEM</span>
                                            )}
                                        </div>
                                        {p.description && (
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                                {p.description}
                                            </p>
                                        )}
                                    </button>
                                    {!p.is_default && (
                                        <div style={{ display: 'flex', gap: 2, paddingRight: 8 }}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--text-muted)', padding: 4,
                                                }}
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(p.prompt_id); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#ef4444', padding: 4,
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Create new */}
                            <button
                                type="button"
                                onClick={handleCreate}
                                style={{
                                    width: '100%', padding: '10px 14px', textAlign: 'left',
                                    background: 'transparent', border: 'none',
                                    color: 'var(--primary)', fontSize: 12, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <Plus size={13} /> Create Custom Prompt
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Preview toggle */}
            {selectedPrompt && (
                <div style={{ marginTop: 8 }}>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}
                    >
                        <Eye size={12} /> {showPreview ? 'Hide Preview' : 'Preview Prompt'}
                    </button>
                    {showPreview && (
                        <div style={{
                            marginTop: 8, padding: 14, borderRadius: 10,
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                            maxHeight: 200, overflowY: 'auto',
                        }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                                System Prompt
                            </p>
                            <pre style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: '0 0 12px', lineHeight: 1.5 }}>
                                {selectedPrompt.system_prompt}
                            </pre>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                                Template
                            </p>
                            <pre style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: '0 0 12px', lineHeight: 1.5 }}>
                                {selectedPrompt.prompt_template?.slice(0, 500)}{selectedPrompt.prompt_template?.length > 500 ? '...' : ''}
                            </pre>
                            {selectedPrompt.input_variables?.length > 0 && (
                                <>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                                        Variables (read-only)
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {selectedPrompt.input_variables.map((v: any) => (
                                            <span key={v.name} style={{
                                                padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                                                background: 'rgba(124,92,255,0.12)', color: 'var(--primary)',
                                                border: '1px solid rgba(124,92,255,0.25)',
                                            }}>
                                                <Code2 size={9} style={{ display: 'inline', marginRight: 3 }} />
                                                {`{${v.name}}`}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <PromptModal
                    initial={editingPrompt}
                    onSave={handleModalSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

/* ────────────────────────────────────── */
/* Prompt Create/Edit Modal              */
/* ────────────────────────────────────── */

function PromptModal({ initial, onSave, onClose }: {
    initial: any | null;
    onSave: (data: any) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [systemPrompt, setSystemPrompt] = useState(initial?.system_prompt || '');
    const [template, setTemplate] = useState(initial?.prompt_template || '');
    const [temperature, setTemperature] = useState(initial?.temperature ?? 0.7);
    const [saving, setSaving] = useState(false);

    // Auto-extract variables from template for preview
    const extractedVars = React.useMemo((): string[] => {
        const matches: string[] = template.match(/(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?!\})/g) || [];
        const stripped: string[] = matches.map((m) => m.slice(1, -1));
        const seen = new Set<string>();
        return stripped.filter((v) => { if (seen.has(v)) return false; seen.add(v); return true; });
    }, [template]);

    const handleSubmit = async () => {
        if (!name.trim() || !systemPrompt.trim() || !template.trim()) return;
        setSaving(true);
        await onSave({
            name: name.trim(),
            description: description.trim(),
            system_prompt: systemPrompt,
            prompt_template: template,
            temperature,
        });
        setSaving(false);
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 8,
        border: '1.5px solid var(--border-default)', background: 'var(--bg-primary)',
        color: 'var(--text-primary)', fontSize: 13, outline: 'none',
    };

    return (
        <>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', zIndex: 101,
                width: 560, maxWidth: 'calc(100vw - 40px)', maxHeight: '85vh',
                background: 'linear-gradient(165deg, rgba(22,22,36,0.99) 0%, rgba(14,14,24,0.99) 100%)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18,
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 22px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {initial ? 'Edit Prompt' : 'Create Custom Prompt'}
                    </h3>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
                                Name <span style={{ color: '#e74c3c' }}>*</span>
                            </label>
                            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Brand Prompt" />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
                                Description
                            </label>
                            <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
                                System Prompt <span style={{ color: '#e74c3c' }}>*</span>
                            </label>
                            <textarea
                                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'monospace', fontSize: 12 }}
                                rows={4}
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                placeholder="You are a world-class brand strategist..."
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
                                Prompt Template <span style={{ color: '#e74c3c' }}>*</span>
                            </label>
                            <textarea
                                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'monospace', fontSize: 12 }}
                                rows={10}
                                value={template}
                                onChange={e => setTemplate(e.target.value)}
                                placeholder="Create a brand identity for {business_name}..."
                            />
                            {extractedVars.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                                        Detected Variables
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {extractedVars.map(v => (
                                            <span key={v} style={{
                                                padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                                                background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                                                border: '1px solid rgba(34,197,94,0.25)',
                                            }}>
                                                {`{${v}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
                                Temperature ({temperature})
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={temperature}
                                onChange={e => setTemperature(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', justifyContent: 'flex-end', gap: 10,
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '9px 20px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || !name.trim() || !systemPrompt.trim() || !template.trim()}
                        style={{
                            padding: '9px 22px', background: 'var(--primary)',
                            border: 'none', borderRadius: 10, color: 'white',
                            fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Saving...' : initial ? 'Update Prompt' : 'Create Prompt'}
                    </button>
                </div>
            </div>
        </>
    );
}
