/**
 * AgentForm — Dynamic form renderer for all 78 agents.
 *
 * Uses the FORM_FIELDS registry from agentFormFields.ts to render
 * agent-specific fields. Brand Identity still uses its dedicated form.
 * All other agents use this dynamic renderer.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles, RefreshCw, AlertCircle, Info, Globe, X,
    // Field icons (alphabetical)
    AlignLeft, Ban, BarChart3, Box, Brain, Briefcase, Building2,
    Calendar, Camera, Clock, Code, DollarSign,
    FileText, Film, Flag, FlaskConical, Gift,
    Hash, Heart, Image, Layers, Lightbulb, Link, ListChecks,
    ListOrdered, Mail, MapPin, Megaphone, MessageSquarePlus, Mic,
    Monitor, MousePointerClick, Package, Paintbrush, Palette,
    Rocket, Search, Shapes, Shield, SlidersHorizontal,
    Share2, Sun, Swords, Tag, Target, Type, Users, Wand2, Zap,
    ClipboardList, CheckCircle, Save
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { agentApi } from '../../services/api';
import { KnowledgeBaseInput, UrlScraperInput, OutputSelector } from './SharedFields';
import { BrandIdentityForm } from './agents/BrandIdentityForm';
import PromptSelector from './PromptSelector';
import { FORM_FIELDS, FormFieldDef } from '../../data/agentFormFields';
import { AGENT_CATEGORIES } from '../../data/agents';
import { Toggle } from './Toggle';
import { ColorInput } from './ColorInput';

const BRIEF_FIELDS: FormFieldDef[] = [
    {
        name: 'brief_primary_goal', icon: 'Target', type: 'select', label: 'Primary Goal', section: 'Marketing Brief',
        options: [
            { label: 'Not sure / General', value: '' },
            { label: 'Brand awareness', value: 'awareness' },
            { label: 'Engagement', value: 'engagement' },
            { label: 'Traffic', value: 'traffic' },
            { label: 'Lead generation', value: 'leads' },
            { label: 'Sales / Conversions', value: 'sales' },
            { label: 'Retention', value: 'retention' },
        ],
        helpText: 'Used to shape the angle, CTA, and structure across all agents.',
    },
    { name: 'brief_product_or_service', icon: 'Package', type: 'textarea', label: 'Product / Service', section: 'Marketing Brief', placeholder: 'What are you promoting? (1–2 sentences)', rows: 2 },
    { name: 'brief_offer', icon: 'Gift', type: 'textarea', label: 'Offer / Hook', section: 'Marketing Brief', placeholder: 'Any offer, pricing, guarantee, or compelling hook?', rows: 2 },
    { name: 'brief_call_to_action', icon: 'MousePointerClick', type: 'text', label: 'Call To Action', section: 'Marketing Brief', placeholder: 'e.g. Book a demo, Start free trial, Buy now' },
    { name: 'brief_target_persona', icon: 'Users', type: 'text', label: 'Target Persona (short)', section: 'Marketing Brief', placeholder: 'e.g. D2C founders, HR managers, new parents, runners 25–40...' },
    {
        name: 'brief_funnel_stage', icon: 'MapPin', type: 'select', label: 'Funnel Stage', section: 'Marketing Brief',
        options: [
            { label: 'Auto', value: '' },
            { label: 'Top (TOFU)', value: 'TOFU' },
            { label: 'Middle (MOFU)', value: 'MOFU' },
            { label: 'Bottom (BOFU)', value: 'BOFU' },
        ],
    },
    { name: 'brief_key_points', icon: 'ListChecks', type: 'tags', label: 'Key Points', section: 'Marketing Brief', placeholder: 'Add a key message and press Enter', max: 12, helpText: 'Features, differentiators, key messages.' },
    { name: 'brief_proof_points', icon: 'Shield', type: 'tags', label: 'Proof Points', section: 'Marketing Brief', placeholder: 'Add proof and press Enter', max: 12, helpText: 'Testimonials, stats, social proof, guarantees.' },
    { name: 'brief_constraints', icon: 'Ban', type: 'tags', label: 'Constraints', section: 'Marketing Brief', placeholder: 'Add a constraint and press Enter', max: 12, helpText: 'Claims to avoid, words to avoid, must-include lines, compliance notes.' },
];

// Icon lookup map for dynamic field icons (field.icon → component)
const ICON_MAP: Record<string, React.ComponentType<any>> = {
    AlignLeft, Ban, BarChart3, Box, Brain, Briefcase, Building2,
    Calendar, Camera, Clock, Code, DollarSign,
    FileText, Film, Flag, FlaskConical, Gift, Globe,
    Hash, Heart, Image, Layers, Lightbulb, Link, ListChecks,
    ListOrdered, Mail, MapPin, Megaphone, MessageSquarePlus, Mic,
    Monitor, MousePointerClick, Package, Paintbrush, Palette,
    Rocket, Search, Shapes, Shield, SlidersHorizontal,
    Share2, Sun, Swords, Tag, Target, Type, Users, Wand2, Zap,
};

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

function FieldLabel({ label, required, hint, icon }: { label: string; required?: boolean; hint?: string; icon?: string }) {
    const IconComponent = icon ? ICON_MAP[icon] || null : null;
    return (
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            {IconComponent && (
                <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: 'rgba(124,92,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <IconComponent size={14} color="#7c5cff" />
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
        if (tags.some(t => t.toLowerCase() === val.toLowerCase())) { setInput(''); return; }
        onChange([...tags, val]);
        setInput('');
    };

    const removeTag = (idx: number) => onChange(tags.filter((_, i) => i !== idx));

    return (
        <div>
            <div
                onClick={() => inputRef.current?.focus()}
                style={{
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                    padding: '8px 12px', minHeight: 44,
                    borderRadius: 10, border: '1.5px solid var(--border-default)',
                    background: 'var(--bg-primary)', cursor: 'text',
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
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {tags.length < max && (
                    <input ref={inputRef} type="text" value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } else if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags.length - 1); }}
                        onBlur={() => { if (input.trim()) addTag(); }}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, padding: '2px 0' }}
                    />
                )}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{tags.length}/{max} added</p>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* DYNAMIC FIELD RENDERER                                     */
/* ────────────────────────────────────────────────────────── */

const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    Object.assign(e.target.style, inputFocusStyle);
};
const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
};

function DynamicField({ field, value, onChange }: {
    field: FormFieldDef;
    value: any;
    onChange: (name: string, value: any) => void;
}) {
    switch (field.type) {
        case 'text':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <input
                        type="text"
                        style={inputStyle}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={value || ''}
                        onChange={e => onChange(field.name, e.target.value)}
                        onFocus={handleFocus as any}
                        onBlur={handleBlur as any}
                    />
                </div>
            );

        case 'textarea':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <textarea
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                        rows={field.rows || 3}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={value || ''}
                        onChange={e => onChange(field.name, e.target.value)}
                        onFocus={handleFocus as any}
                        onBlur={handleBlur as any}
                    />
                </div>
            );

        case 'select':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <select
                        style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' as any }}
                        value={value ?? field.defaultValue ?? ''}
                        onChange={e => onChange(field.name, e.target.value)}
                        onFocus={handleFocus as any}
                        onBlur={handleBlur as any}
                    >
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            );

        case 'tags':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <TagInput
                        tags={Array.isArray(value) ? value : []}
                        onChange={v => onChange(field.name, v)}
                        max={field.max || 8}
                        placeholder={field.placeholder}
                    />
                </div>
            );

        case 'colors':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <ColorInput
                        colors={Array.isArray(value) ? value : []}
                        onChange={v => onChange(field.name, v)}
                        max={field.max || 5}
                    />
                </div>
            );

        case 'number':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <input
                        type="number"
                        style={{ ...inputStyle, width: 140 }}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        value={value ?? field.defaultValue ?? ''}
                        onChange={e => onChange(field.name, e.target.value ? Number(e.target.value) : undefined)}
                        onFocus={handleFocus as any}
                        onBlur={handleBlur as any}
                    />
                </div>
            );

        case 'url':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <input
                        type="url"
                        style={inputStyle}
                        placeholder={field.placeholder || 'https://...'}
                        required={field.required}
                        value={value || ''}
                        onChange={e => onChange(field.name, e.target.value)}
                        onFocus={handleFocus as any}
                        onBlur={handleBlur as any}
                    />
                </div>
            );

        case 'slider':
            return (
                <div>
                    <FieldLabel label={field.label} required={field.required} hint={field.helpText} icon={field.icon} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            type="range"
                            min={field.min ?? 0}
                            max={field.max ?? 1}
                            step={field.step ?? 0.1}
                            value={value ?? field.defaultValue ?? 0.5}
                            onChange={e => onChange(field.name, parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary)' }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', minWidth: 32, textAlign: 'center' }}>
                            {(value ?? field.defaultValue ?? 0.5).toFixed(1)}
                        </span>
                    </div>
                </div>
            );

        case 'checkbox':
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Toggle
                        checked={value ?? field.defaultValue ?? false}
                        onChange={v => onChange(field.name, v)}
                    />
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => onChange(field.name, !(value ?? field.defaultValue ?? false))}
                    >
                        {field.label}
                    </label>
                    {field.helpText && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {field.helpText}</span>}
                </div>
            );

        default:
            return null;
    }
}

/* ────────────────────────────────────────────────────────── */
/* MAIN COMPONENT                                             */
/* ────────────────────────────────────────────────────────── */

interface AgentFormProps {
    agentId: string;
    onGenerate: (output: any) => void;
    setIsGenerating: (loading: boolean) => void;
    initialValues?: Record<string, any>;
    onFormDataChange?: (data: Record<string, any>) => void;
    draftCardId?: string | null;
    onSaveDraft?: (data: Record<string, any>) => void;
}
export const AgentForm: React.FC<AgentFormProps> = ({
    agentId, onGenerate, setIsGenerating, initialValues, onFormDataChange, draftCardId, onSaveDraft,
}) => {
    const {
        activeWorkspace,
        activeCampaign,
        urls,
        files,
        kbUploadsInFlight,
        selectedOutputs,
        selectedKnowledgeDocumentIds,
        setSelectedKnowledgeDocumentIds,
        setSelectedOutputs,
        setUrls,
        resetCoreForm,
        scraperPreviewed,
    } = useAppStore();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [targetLanguage, setTargetLanguage] = useState('English');
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fields = FORM_FIELDS[agentId] || [];
    
    // Find agent definition and its parent category title
    let agentDef: any = null;
    let agentCategory = 'general';
    for (const cat of AGENT_CATEGORIES) {
        const found = cat.agents.find(a => a.id === agentId);
        if (found) {
            agentDef = found;
            agentCategory = cat.title.toLowerCase().split(' & ')[0].split(' ')[0]; // Simplified for key compat
            break;
        }
    }

    // Visual agents accept images (max 4), all others accept text docs (max 1)
    const VISUAL_AGENTS = new Set([
        'logo_designer', 'hero_image', 'product_photoshoot', 'ad_creative',
        'image_editor', 'mockup_generator', 'thumbnail_idea',
    ]);
    const isVisualAgent = VISUAL_AGENTS.has(agentId);
    const kbMaxFiles = isVisualAgent ? 4 : 1;
    const kbAcceptTypes = '.pdf,.txt,.md,.csv,.docx,image/*';

    // ── Brand Identity: delegate to dedicated form ──
    if (agentId === 'brand_identity') {
        return (
            <BrandIdentityForm
                onGenerate={onGenerate}
                setIsGenerating={setIsGenerating}
                initialValues={initialValues}
                onFormDataChange={onFormDataChange}
                draftCardId={draftCardId}
            />
        );
    }

    // ── Initialize defaults from field definitions ──
    useEffect(() => {
        const defaults: Record<string, any> = {};
        [...BRIEF_FIELDS, ...fields].forEach(f => {
            if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
            if (f.type === 'tags' || f.type === 'colors') defaults[f.name] = [];
        });
        setFormData(defaults);
        setTargetLanguage('English');
        setSelectedPromptId(null);
        resetCoreForm();
    }, [agentId]);

    // ── Restore saved form values ──
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            setFormData(prev => {
                const restored = { ...prev };
                for (const f of [...BRIEF_FIELDS, ...fields]) {
                    if (initialValues[f.name] !== undefined) {
                        restored[f.name] = initialValues[f.name];
                    }
                }
                if (initialValues.additional_instructions) {
                    restored.additional_instructions = initialValues.additional_instructions;
                }
                return restored;
            });
            if (initialValues.target_language) setTargetLanguage(initialValues.target_language);
            if (initialValues.prompt_id) setSelectedPromptId(initialValues.prompt_id);
            setSelectedKnowledgeDocumentIds(initialValues.selected_kb_document_ids || []);
            setSelectedOutputs(initialValues.selected_outputs || []);
            setUrls(initialValues.urls_to_scrape || []);
        }
    }, [initialValues, agentId]);

    // ── Notify parent of form data changes ──
    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange({
                ...formData,
                target_language: targetLanguage,
                prompt_id: selectedPromptId,
                selected_kb_document_ids: selectedKnowledgeDocumentIds,
                selected_outputs: selectedOutputs,
                urls_to_scrape: urls,
            });
        }
    }, [formData, targetLanguage, selectedPromptId, selectedKnowledgeDocumentIds, selectedOutputs, urls]);

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace) return;

        if (kbUploadsInFlight > 0) {
            setError('Please wait for KB file uploads to finish before generating.');
            return;
        }

        // Validate required fields
        for (const f of fields) {
            if (f.required) {
                const val = formData[f.name];
                if ((f.type === 'tags' || f.type === 'colors') && (!Array.isArray(val) || val.length === 0)) {
                    setError(`${f.label} is required.`);
                    return;
                }
                if (f.type !== 'tags' && f.type !== 'checkbox' && (!val || (typeof val === 'string' && !val.trim()))) {
                    setError(`${f.label} is required.`);
                    return;
                }
            }
        }

        // Validate scraper: URLs must be previewed before generating
        if (urls.length > 0 && !scraperPreviewed) {
            setError('Please scrape the added URLs first (click "Scrape Now") before generating.');
            return;
        }

        setError(null);
        setSubmitting(true);
        setIsGenerating(true);

        // Transform special fields to match backend schemas
        const payloadFormData = { ...formData };
        if (formData.posting_frequency) {
            const val = formData.posting_frequency;
            if (typeof val === 'string') {
                let parsed: any = undefined;
                try {
                    parsed = JSON.parse(val);
                } catch {
                    parsed = val.split(',').map((p: string) => p.trim()).filter(Boolean).reduce((acc: Record<string, number>, pair: string) => {
                        const [k, v] = pair.split(':').map(s => s.trim());
                        if (k && v && !isNaN(Number(v))) acc[k] = Number(v);
                        return acc;
                    }, {});
                }
                if (parsed && Object.keys(parsed).length > 0) {
                    payloadFormData.posting_frequency = parsed;
                } else {
                    delete payloadFormData.posting_frequency;
                }
            }
        }

        try {
            const payload = {
                ...payloadFormData,
                agent_id: agentId,
                workspace_id: activeWorkspace.uuid,
                campaign_id: activeCampaign?.id,
                target_language: targetLanguage,
                prompt_id: selectedPromptId || undefined,
                urls_to_scrape: urls,
                selected_outputs: selectedOutputs,
                selected_kb_document_ids: selectedKnowledgeDocumentIds,
                additional_instructions: formData.additional_instructions || '',
            };

            const response = await agentApi.generateCore(agentId, payload, files);
            onGenerate(response);
        } catch (err: any) {
            setError(err.message || 'Generation failed. Please try again.');
        } finally {
            setSubmitting(false);
            setIsGenerating(false);
        }
    };

    // ── Group fields by section ──
    const sections: { name: string; fields: FormFieldDef[] }[] = [];
    let currentSection = { name: '', fields: [] as FormFieldDef[] };

    fields.forEach(f => {
        if (f.section && f.section !== currentSection.name) {
            if (currentSection.fields.length > 0) sections.push(currentSection);
            currentSection = { name: f.section, fields: [f] };
        } else {
            currentSection.fields.push(f);
        }
    });
    if (currentSection.fields.length > 0) sections.push(currentSection);

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
                        {agentDef.desc && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                {agentDef.desc}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── OUTPUT LANGUAGE ── */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    marginBottom: 12, paddingLeft: 12,
                    borderLeft: '3px solid #7c5cff',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <Globe size={13} color="#7c5cff" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Output Language
                    </span>
                </div>
                <select
                    value={targetLanguage}
                    onChange={e => setTargetLanguage(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' as any }}
                    onFocus={handleFocus as any}
                    onBlur={handleBlur as any}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            {/* ── PROMPT SELECTOR ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <PromptSelector
                agentId={agentId}
                category={agentCategory}
                selectedPromptId={selectedPromptId}
                onSelect={setSelectedPromptId}
            />

            {/* ── DYNAMIC AGENT FIELDS ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />

            {sections.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: 28 }}>
                    {section.name && (
                        <div style={{
                            marginBottom: 14, paddingLeft: 12,
                            borderLeft: '3px solid #7c5cff',
                        }}>
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                                {section.name}
                            </span>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {section.fields.map(field => (
                            <DynamicField
                                key={field.name}
                                field={field}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                            />
                        ))}
                    </div>
                    {sIdx < sections.length - 1 && (
                        <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginTop: 28 }} />
                    )}
                </div>
            ))}

            {/* ── MARKETING BRIEF ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    marginBottom: 14, paddingLeft: 12,
                    borderLeft: '3px solid #7c5cff',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <Target size={13} color="#7c5cff" />
                    <span style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                        Marketing Brief
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {BRIEF_FIELDS.map(field => (
                        <DynamicField
                            key={field.name}
                            field={field}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                        />
                    ))}
                </div>
            </div>

            {/* ── SHARED CONTEXT SOURCES ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    marginBottom: 14, paddingLeft: 12,
                    borderLeft: '3px solid #7c5cff',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <Info size={13} color="#7c5cff" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Context Sources
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <KnowledgeBaseInput
                        maxFiles={kbMaxFiles}
                        acceptTypes={kbAcceptTypes}
                        agentId={agentId}
                        sourceCardId={draftCardId}
                        allowUpload={false}
                    />
                    <UrlScraperInput />
                    <OutputSelector />
                </div>
            </div>

            {/* ── ADDITIONAL INSTRUCTIONS ── */}
            <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.5, marginBottom: 20 }} />
            <div style={{ marginBottom: 20 }}>
                <FieldLabel label="Additional Instructions" hint="Any extra guidance for the AI agent" icon="MessageSquarePlus" />
                <textarea
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    rows={3}
                    placeholder="Anything else the agent should know?"
                    value={formData.additional_instructions || ''}
                    onChange={e => handleInputChange('additional_instructions', e.target.value)}
                    onFocus={handleFocus as any}
                    onBlur={handleBlur as any}
                />
            </div>

            {/* ── ERROR ── */}
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
                            ...formData,
                            target_language: targetLanguage,
                            prompt_id: selectedPromptId,
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
                        <><RefreshCw size={18} className="animate-spin" /> Generating...</>
                    ) : (
                        <><Sparkles size={18} /> Generate {agentDef?.name || agentId.replace(/_/g, ' ')}</>
                    )}
                </button>
            </div>
        </form>
    );
};
