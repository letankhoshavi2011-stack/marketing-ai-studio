import React from 'react';
import {
    Sparkles, Mic, Gauge, Smile, Ban, Quote, ListChecks, Highlighter
} from 'lucide-react';

interface BrandVoiceOutputProps {
    data: {
        tone?: string[];
        formality?: number;
        avg_sentence_length?: number;
        vocabulary_level?: string;
        preferred_words?: Record<string, any>;
        avoid_words?: string[];
        uses_emojis?: boolean;
        uses_exclamations?: boolean;
        paragraph_style?: string;
        custom_rules?: string[];
        voice_prompt?: string;
        context_updates?: any;
    };
    compact?: boolean;
}

const pill = (text: string, subtle = false) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: subtle ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-default)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        background: subtle ? 'rgba(255,255,255,0.04)' : 'var(--bg-primary)'
    }}>
        {text}
    </span>
);

const boolChip = (label: string, active?: boolean) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 10,
        border: `1px solid ${active ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
        fontSize: 12,
        fontWeight: 700,
        color: active ? '#22c55e' : 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
    }}>
        {active ? <Sparkles size={12} color="#22c55e" /> : <Ban size={12} color="var(--text-muted)" />}
        {label}
    </span>
);

const normalizePercent = (val?: number) => {
    if (val === undefined || val === null || Number.isNaN(Number(val))) return undefined;
    const num = Number(val);
    const pct = num <= 1 ? num * 100 : num;
    return Math.max(0, Math.min(100, pct));
};

export const BrandVoiceOutput: React.FC<BrandVoiceOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    const tone = data.tone || [];
    const formality = normalizePercent(data.formality);
    const preferredEntries = Object.entries(data.preferred_words || {});
    const avoid = data.avoid_words || [];
    const customRules = data.custom_rules || [];
    const voicePrompt = data.voice_prompt;
    const contextUpdates = data.context_updates || {};

    const stat = (label: string, value?: string | number, helper?: string) => {
        if (value === undefined || value === null || value === '') return null;
        return (
            <div style={{
                padding: compact ? 10 : 12,
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 120
            }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</span>
                {helper && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{helper}</span>}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {(contextUpdates.voice_profile || contextUpdates.tone_keywords || contextUpdates.voice_rules) && (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    border: '1px solid rgba(34,197,94,0.25)',
                    background: 'rgba(34,197,94,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <Sparkles size={16} color="#22c55e" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Saved to Brand Context</span>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            Voice profile, tone keywords, and guardrails synced for other agents.
                        </span>
                    </div>
                </div>
            )}

            {/* Voice DNA summary */}
            <div style={{
                padding: compact ? 14 : 18,
                borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(124,92,255,0.10))',
                border: '1px solid rgba(124,92,255,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Mic size={20} color="var(--accent-1)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Brand Voice Analyzer</span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            Tone, cadence, vocabulary, and guardrails distilled into a ready-to-use voice profile.
                        </span>
                    </div>
                </div>

                {tone.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {tone.map((t, i) => pill(t))}
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 10
                }}>
                    {formality !== undefined && (
                        <div style={{
                            padding: compact ? 10 : 12,
                            borderRadius: 12,
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Gauge size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Formality</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: 8,
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.06)',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{
                                    width: `${formality}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #22c55e, #7c5cfc)'
                                }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(formality)}/100</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>0 = casual, 100 = formal</span>
                        </div>
                    )}

                    {stat('Avg sentence length', data.avg_sentence_length ? `${Math.round(data.avg_sentence_length)} words` : undefined)}
                    {stat('Vocabulary', data.vocabulary_level || undefined)}
                    {stat('Paragraph style', data.paragraph_style || undefined)}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {boolChip('Uses emojis', data.uses_emojis)}
                        {boolChip('Uses exclamations', data.uses_exclamations)}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: compact ? 10 : 14
            }}>
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 14,
                    padding: compact ? 12 : 14,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={16} color="var(--primary)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Preferred Language</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {preferredEntries.length > 0 ? preferredEntries.map(([k, v], i) => pill(`${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`))
                            : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No preferred terms specified.</span>}
                    </div>
                </div>

                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 14,
                    padding: compact ? 12 : 14,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Ban size={16} color="#ef4444" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Avoid</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {avoid.length > 0 ? avoid.map((w, i) => pill(w, true))
                            : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No words flagged to avoid.</span>}
                    </div>
                </div>
            </div>

            {customRules.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 14,
                    padding: compact ? 12 : 14,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Highlighter size={16} color="var(--accent-1)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Voice Rules</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {customRules.map((rule, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 8 }}>
                                <Quote size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {voicePrompt && (
                <div style={{
                    border: '1px solid rgba(124,92,255,0.3)',
                    borderRadius: 14,
                    padding: compact ? 12 : 14,
                    background: 'rgba(124,92,255,0.08)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={16} color="var(--accent-1)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Ready-to-use prompt</span>
                    </div>
                    <pre style={{
                        margin: 0,
                        padding: 12,
                        borderRadius: 10,
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)',
                        fontSize: 12,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.55
                    }}>
{voicePrompt}
                    </pre>
                </div>
            )}
        </div>
    );
};
