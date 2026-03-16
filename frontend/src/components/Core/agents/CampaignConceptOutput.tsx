import React from 'react';
import { Sparkles, Target, Lightbulb, Heart, LayoutTemplate, ListChecks, Crown } from 'lucide-react';

interface CampaignConcept {
    name: string;
    theme?: string;
    messaging_angle?: string;
    suggested_assets?: string[];
    target_emotion?: string;
    tagline?: string;
}

interface CampaignConceptOutputProps {
    data: {
        title?: string;
        concepts?: CampaignConcept[];
        recommended?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

const pill = (text: string) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontSize: 12
    }}>
        {text}
    </span>
);

export const CampaignConceptOutput: React.FC<CampaignConceptOutputProps> = ({ data, compact = false }) => {
    const concepts = data?.concepts || [];
    const recommended = data?.recommended;
    const sections = data?.sections || [];
    const recommendations = data?.recommendations || data?.action_items || [];
    if (!concepts.length && !sections.length) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Title */}
            {data.title && (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(56,189,248,0.10))',
                    border: '1px solid rgba(124,92,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <LayoutTemplate size={18} color="var(--accent-1)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>
                        {recommended && <span style={{ fontSize: 12, color: 'var(--accent-1)', fontWeight: 700 }}>Recommended: {recommended}</span>}
                    </div>
                </div>
            )}

            {/* Concepts grid */}
            {concepts.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {concepts.map((c, i) => {
                        const isRec = recommended && (recommended === c.name || recommended === String(i + 1));
                        return (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)',
                                borderRadius: 14,
                                padding: compact ? 12 : 14,
                                background: 'var(--bg-secondary)',
                                display: 'flex', flexDirection: 'column', gap: 8,
                                position: 'relative'
                            }}>
                                {isRec && (
                                    <div style={{
                                        position: 'absolute', top: 10, right: 10,
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 9px',
                                        borderRadius: 999,
                                        background: 'rgba(34,197,94,0.12)',
                                        border: '1px solid rgba(34,197,94,0.3)',
                                        color: '#22c55e',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.04em'
                                    }}>
                                        <Crown size={12} /> Top pick
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Sparkles size={16} color="var(--primary)" />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {c.name || `Concept ${i + 1}`}
                                    </span>
                                </div>
                                {c.tagline && <span style={{ fontSize: 12.5, color: 'var(--accent-1)', fontWeight: 700 }}>{c.tagline}</span>}
                                {c.theme && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Theme: {c.theme}</span>}
                                {c.messaging_angle && (
                                    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {c.messaging_angle}
                                    </p>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {c.target_emotion && pill(`Emotion: ${c.target_emotion}`)}
                                    {c.suggested_assets?.map((a, idx) => pill(a))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sections (structured brief) */}
            {sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Target size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations / actions */}
            {recommendations.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommended next steps</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recommendations.map((r, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8 }}>
                                <Heart size={12} color="var(--accent-1)" style={{ marginTop: 2 }} />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
