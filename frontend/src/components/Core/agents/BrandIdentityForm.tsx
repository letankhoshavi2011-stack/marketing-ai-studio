import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles, RefreshCw, Info, X, Fingerprint,
    Globe, BookOpen, Wand2, Shield, AlertCircle, ClipboardList, CheckCircle, Save
} from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { agentApi } from '../../../services/api';
import { KnowledgeBaseInput, UrlScraperInput, OutputSelector } from '../SharedFields';
import PromptSelector from '../PromptSelector';
import { AGENT_CATEGORIES } from '../../../data/agents';
import { ColorInput } from '../ColorInput';

/* ────────────────────────────────────────────────────────── */
/* TAG INPUT — type + Enter to add, X to remove              */
/* ────────────────────────────────────────────────────────── */

function TagInput({
    tags, onChange, max = 8, placeholder = 'Type and press Enter...',
}: {
    tags: string[];
    onChange: (v: string[]) => void;
    max?: number;
    placeholder?: string;
}) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = () => {
        const val = input.trim();
        if (!val || tags.length >= max) return;
        if (tags.some(t => t.toLowerCase() === val.toLowerCase())) {
            setInput('');
            return;
        }
        onChange([...tags, val]);
        setInput('');
    };

    const removeTag = (idx: number) => {
        onChange(tags.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div>
            <div
                onClick={() => inputRef.current?.focus()}
                style={{
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                    padding: '8px 12px', minHeight: 44,
                    borderRadius: 10, border: '1.5px solid var(--border-default)',
                    background: 'var(--bg-primary)', cursor: 'text',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
            >
                {tags.map((tag, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                        background: 'rgba(124,92,255,0.15)', color: 'var(--primary)',
                        border: '1px solid rgba(124,92,255,0.3)',
                    }}>
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                            style={{
                                background: 'none', border: 'none', color: 'var(--primary)',
                                cursor: 'pointer', padding: 0, display: 'flex',
                                alignItems: 'center', opacity: 0.7,
                            }}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {tags.length < max && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => { if (input.trim()) addTag(); }}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        style={{
                            flex: 1, minWidth: 120, border: 'none', outline: 'none',
                            background: 'transparent', color: 'var(--text-primary)',
                            fontSize: 13, padding: '2px 0',
                        }}
                    />
                )}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                {tags.length}/{max} added
            </p>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* REUSABLE SUB-COMPONENTS                                    */
/* ────────────────────────────────────────────────────────── */

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese (Simplified)',
    'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Italian', 'Russian',
    'Dutch', 'Turkish', 'Thai', 'Vietnamese', 'Indonesian', 'Polish',
    'Swedish', 'Hebrew',
];

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--border-default)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

const inputFocusStyle: React.CSSProperties = {
    borderColor: '#7c5cff',
    boxShadow: '0 0 0 3px rgba(124,92,255,0.12)',
};

function SectionHeader({ title, icon: Icon }: { title: string; icon?: any }) {
    return (
        <div style={{
            marginBottom: 14, paddingLeft: 12,
            borderLeft: '3px solid #7c5cff',
            display: 'flex', alignItems: 'center', gap: 8,
        }}>
            {Icon && <Icon size={13} color="#7c5cff" />}
            <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
                {title}
            </span>
        </div>
    );
}

function FieldLabel({ label, required, hint, icon: Icon }: { label: string; required?: boolean; hint?: string, icon?: any }) {
    return (
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icon && (
                <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: 'rgba(124,92,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon size={14} color="#7c5cff" />
                </div>
            )}
            <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
                </label>
                {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{hint}</p>}
            </div>
        </div>
    );
}

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    Object.assign(e.target.style, inputFocusStyle);
};
const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
};

/* ────────────────────────────────────────────────────────── */
/* MAIN FORM COMPONENT                                         */
/* ────────────────────────────────────────────────────────── */

interface BrandIdentityFormProps {
    onGenerate: (output: any) => void;
    setIsGenerating: (v: boolean) => void;
    initialValues?: Record<string, any>;
    onFormDataChange?: (data: Record<string, any>) => void;
    draftCardId?: string | null;
    onSaveDraft?: (data: Record<string, any>) => void;
}
export const BrandIdentityForm: React.FC<BrandIdentityFormProps> = ({
    onGenerate,
    setIsGenerating,
    initialValues,
    onFormDataChange,
    draftCardId,
    onSaveDraft,
}) => {
    const {
        activeWorkspace,
        activeCampaign,
        urls,
        files,
        kbUploadsInFlight,
        scraperPreviewed,
        selectedOutputs,
        selectedKnowledgeDocumentIds,
        setSelectedKnowledgeDocumentIds,
        setSelectedOutputs,
        setUrls,
        resetCoreForm,
    } = useAppStore();

    const [form, setForm] = useState({
        target_language: 'English',
        business_name: '',
        business_description: '',
        industry: '',
        target_audience: '',
        values: [] as string[],
        style_preferences: [] as string[],
        color_preferences: [] as string[],
        additional_instructions: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

    const agentDef = AGENT_CATEGORIES.flatMap(c => c.agents).find(a => a.id === 'brand_identity');

    useEffect(() => {
        resetCoreForm();
    }, []);

    // Restore form from saved initialValues
    useEffect(() => {
        if (initialValues) {
            setForm(prev => ({
                ...prev,
                target_language: initialValues.target_language || prev.target_language,
                business_name: initialValues.business_name || prev.business_name,
                business_description: initialValues.business_description || prev.business_description,
                industry: initialValues.industry || prev.industry,
                target_audience: initialValues.target_audience || prev.target_audience,
                values: Array.isArray(initialValues.values) ? initialValues.values : prev.values,
                style_preferences: Array.isArray(initialValues.style_preferences) ? initialValues.style_preferences : prev.style_preferences,
                color_preferences: Array.isArray(initialValues.color_preferences) ? initialValues.color_preferences : prev.color_preferences,
                additional_instructions: initialValues.additional_instructions || prev.additional_instructions,
            }));
            setSelectedKnowledgeDocumentIds(initialValues.selected_kb_document_ids || []);
            setSelectedOutputs(initialValues.selected_outputs || []);
            setUrls(initialValues.urls_to_scrape || []);
        }
    }, [initialValues]);

    const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace) return;

        if (kbUploadsInFlight > 0) {
            setError('Please wait for KB file uploads to finish before generating.');
            return;
        }

        // Validation
        if (!form.business_description.trim()) {
            setError('Business description is required.');
            return;
        }
        if (!form.industry.trim()) {
            setError('Industry is required.');
            return;
        }
        if (!form.target_audience.trim()) {
            setError('Target audience is required.');
            return;
        }

        // URL scraping check (if user added URLs in context sources)
        if (urls.length > 0 && !scraperPreviewed) {
            setError('Please scrape the added URLs first (click "Scrape Now") before generating.');
            return;
        }

        setError(null);
        setSubmitting(true);
        setIsGenerating(true);

        try {
            const payload = {
                ...form,
                target_language: form.target_language,
                workspace_id: activeWorkspace.uuid,
                campaign_id: activeCampaign?.id,
                prompt_id: selectedPromptId || undefined,
                urls_to_scrape: urls, // source_url removed, use global urls
                selected_outputs: selectedOutputs,
                selected_kb_document_ids: selectedKnowledgeDocumentIds,
            };

            const response = await agentApi.generateBrandIdentity(payload, files);
            onGenerate(response);
        } catch (err: any) {
            setError(err.message || 'Generation failed. Please try again.');
        } finally {
            setSubmitting(false);
            setIsGenerating(false);
        }
    };

    // Expose form data to parent via callback
    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange({
                ...form,
                prompt_id: selectedPromptId,
                selected_kb_document_ids: selectedKnowledgeDocumentIds,
                selected_outputs: selectedOutputs,
                urls_to_scrape: urls,
            });
        }
    }, [form, selectedPromptId, selectedKnowledgeDocumentIds, selectedOutputs, urls]);

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── AGENT HEADER ── */}
            {agentDef && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(124,92,255,0.06)',
                    border: '1px solid rgba(124,92,255,0.12)',
                }}>
                    {agentDef.icon && (
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(124,92,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <agentDef.icon size={18} color="#7c5cff" />
                        </div>
                    )}
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {agentDef.name}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {agentDef.desc || "Build a comprehensive brand strategy, visual identity guidelines, and core messaging."}
                        </p>
                    </div>
                </div>
            )}

            {/* ── OUTPUT LANGUAGE ── */}
            <div style={{ marginBottom: 20 }}>
                <SectionHeader title="Output Language" icon={Globe} />
                <select
                    value={form.target_language}
                    onChange={e => set('target_language', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            {/* ── PROMPTS HUB ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <PromptSelector
                agentId="brand_identity"
                selectedPromptId={selectedPromptId}
                onSelect={setSelectedPromptId}
            />

            {/* ── BUSINESS DETAILS ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 28 }}>
                <SectionHeader title="Business Details" icon={Fingerprint} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <FieldLabel label="Business / Brand Name" hint="Optional: leave blank for AI to suggest one" icon={BookOpen} />
                        <input
                            type="text"
                            style={inputStyle}
                            placeholder="e.g. NovaTech, BloomWell, Aria..."
                            value={form.business_name}
                            onChange={e => set('business_name', e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div>
                        <FieldLabel label="Business Description" required hint="What does it do? Who does it serve?" icon={Info} />
                        <textarea
                            required
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                            placeholder="e.g. We build AI-powered supply chain tools for mid-market logistics companies..."
                            value={form.business_description}
                            onChange={e => set('business_description', e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div>
                        <FieldLabel label="Industry" required hint="Type your industry or niche" icon={Wand2} />
                        <input
                            type="text"
                            required
                            style={inputStyle}
                            placeholder="e.g. Technology / SaaS, Health & Wellness..."
                            value={form.industry}
                            onChange={e => set('industry', e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div>
                        <FieldLabel label="Target Audience" required hint="Who are your ideal customers?" icon={Wand2} />
                        <input
                            type="text"
                            required
                            style={inputStyle}
                            placeholder="e.g. Millennials aged 25-40, health-conscious professionals..."
                            value={form.target_audience}
                            onChange={e => set('target_audience', e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </div>
                </div>
            </div>

            {/* ── BRAND DIRECTION ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 28 }}>
                <SectionHeader title="Brand Direction" icon={Wand2} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <FieldLabel label="Core Values" hint={`Added (${form.values.length}/6)`} />
                        <TagInput
                            tags={form.values}
                            onChange={v => set('values', v)}
                            max={6}
                            placeholder="e.g. Innovation, Trust..."
                        />
                    </div>

                    <div>
                        <FieldLabel label="Visual Style" hint={`Added (${form.style_preferences.length}/5)`} />
                        <TagInput
                            tags={form.style_preferences}
                            onChange={v => set('style_preferences', v)}
                            max={5}
                            placeholder="e.g. Modern, Minimal, Bold..."
                        />
                    </div>

                    <div>
                        <FieldLabel label="Color Hints" hint="Pick colors using the color picker" />
                        <ColorInput
                            colors={form.color_preferences}
                            onChange={v => set('color_preferences', v)}
                            max={5}
                        />
                    </div>
                </div>
            </div>

            {/* ── SHARED CONTEXT SOURCES ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 24 }}>
                <SectionHeader title="Context Sources" icon={Shield} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <KnowledgeBaseInput agentId="brand_identity" sourceCardId={draftCardId} allowUpload={false} />
                    <UrlScraperInput />
                    <OutputSelector />
                </div>
            </div>

            {/* ── ADDITIONAL INSTRUCTIONS ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 20 }}>
                <FieldLabel label="Additional Instructions" hint="Any other context or preferences?" icon={Info} />
                <textarea
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    placeholder="e.g. Avoid blue — used by our main competitor..."
                    value={form.additional_instructions}
                    onChange={e => set('additional_instructions', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>

            {/* ERROR */}
            {error && (
                <div style={{
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)',
                    color: '#e74c3c', fontSize: 13, marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* ── SUBMIT & DRAFT ── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {onSaveDraft && (
                    <button
                        type="button"
                        onClick={() => onSaveDraft({
                            ...form,
                            selected_kb_document_ids: selectedKnowledgeDocumentIds,
                            selected_outputs: selectedOutputs,
                            urls_to_scrape: urls,
                        })}
                        style={{
                            flex: 1, padding: '14px 20px',
                            borderRadius: 14,
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
                            border: '1.5px solid var(--border-default)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Save size={16} /> Save Draft
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        flex: onSaveDraft ? 2 : 1, padding: '16px 24px',
                        borderRadius: 14,
                        background: submitting
                            ? 'var(--border-default)'
                            : 'linear-gradient(135deg, #7c5cff 0%, #6a4fff 50%, #8b6aff 100%)',
                        color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: '0.02em',
                        border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        transition: 'all 0.25s ease',
                        boxShadow: submitting ? 'none' : '0 4px 15px rgba(124,92,255,0.35)',
                    }}
                >
                    {submitting ? (
                        <><RefreshCw size={18} className="animate-spin" /> Building Brand Identity...</>
                    ) : (
                        <><Sparkles size={18} /> Generate Brand Identity</>
                    )}
                </button>
            </div>
        </form>
    );
};
