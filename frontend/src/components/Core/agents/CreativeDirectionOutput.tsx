import React from 'react';
import { Palette, Camera, Lightbulb, Image as ImageIcon, Sparkles, Layout, Crosshair, Paintbrush, ListChecks, CheckCircle } from 'lucide-react';

interface CreativeDirectionOutputProps {
    data: {
        title?: string;
        sections?: { heading: string, content: string }[];
        recommendations?: string[];
        action_items?: string[];
        mood_description?: string;
        visual_direction?: string;
        color_usage_guide?: string;
        composition_rules?: string[];
        imagery_approach?: string;
        reference_styles?: string[];
    };
    compact?: boolean;
}

const InfoCard = ({ title, icon, content }: { title: string, icon: React.ReactNode, content?: string }) => {
    if (!content) return null;
    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>
                {icon}
                {title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {content}
            </div>
        </div>
    );
};

export const CreativeDirectionOutput: React.FC<CreativeDirectionOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 16,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.1))',
                border: '1px solid rgba(236,72,153,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Palette size={20} color="#ec4899" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {data.title || 'Creative Direction Brief'}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        {data.imagery_approach && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(236,72,153,0.15)', color: '#ec4899', fontWeight: 600, textTransform: 'uppercase' }}>
                                {data.imagery_approach}
                            </span>
                        )}
                        {data.reference_styles && data.reference_styles.length > 0 && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,92,255,0.15)', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Ref: {data.reference_styles[0]}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Core Directives Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                <InfoCard title="Mood & Tone" icon={<Sparkles size={14} color="var(--primary)" />} content={data.mood_description} />
                <InfoCard title="Visual Direction" icon={<ImageIcon size={14} color="#ec4899" />} content={data.visual_direction} />
                <InfoCard title="Color Guide" icon={<Paintbrush size={14} color="#eab308" />} content={data.color_usage_guide} />
            </div>

            {/* Rules & References */}
            {(data.composition_rules?.length || data.reference_styles?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                    {data.composition_rules && data.composition_rules.length > 0 && (
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                                <Crosshair size={14} color="#a855f7" /> Composition Rules
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {data.composition_rules.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {data.reference_styles && data.reference_styles.length > 0 && (
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                                <Camera size={14} color="#eab308" /> Reference Styles
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {data.reference_styles.map((r, i) => (
                                    <span key={i} style={{ padding: '4px 10px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-default)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Standard Sections */}
            {data.sections && data.sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {data.sections.map((s, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Layout size={14} color="var(--primary)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading}</span>
                            </div>
                            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.content}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations & Action Items */}
            {(data.recommendations?.length || data.action_items?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {data.recommendations && data.recommendations.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Lightbulb size={14} color="#eab308" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {data.recommendations.map((r, i) => <div key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>• {r}</div>)}
                            </div>
                        </div>
                    )}
                    {data.action_items && data.action_items.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <CheckCircle size={14} color="#ec4899" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {data.action_items.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>• {a}</div>)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
