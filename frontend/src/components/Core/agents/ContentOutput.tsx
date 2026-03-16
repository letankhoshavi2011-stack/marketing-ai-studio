import React from 'react';
import { FileText, Target, MousePointerClick, Sparkles, Tags, Layout, ListChecks } from 'lucide-react';

interface Section {
    heading?: string;
    content?: string;
}

interface ContentOutputProps {
    data: {
        title?: string;
        subtitle?: string;
        summary?: string;
        sections?: Section[];
        key_points?: string[];
        recommendations?: string[];
        action_items?: string[];
        call_to_action?: string;
        audience?: string;
        channel?: string;
        tone?: string;
        assets?: any[];
    };
    compact?: boolean;
}

const pill = (text: string, icon?: React.ReactNode) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-primary)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
    }}>
        {icon}{text}
    </span>
);

export const ContentOutput: React.FC<ContentOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const sections = data.sections || [];
    const bullets = data.key_points || data.recommendations || [];
    const actions = data.action_items || [];
    const assets = data.assets || [];
    const imageAssets = assets.filter((a: any) => a.asset_type === 'image');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(34,197,94,0.10))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <FileText size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {data.title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                    {data.subtitle || data.summary
                        ? <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{data.subtitle || data.summary}</span>
                        : null}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {data.audience && pill(data.audience, <Target size={12} />)}
                        {data.channel && pill(data.channel, <Tags size={12} />)}
                        {data.tone && pill(data.tone, <Sparkles size={12} />)}
                    </div>
                </div>
                {data.call_to_action && pill(data.call_to_action, <MousePointerClick size={12} />)}
            </div>

            {/* Images */}
            {imageAssets.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 10,
                }}>
                    {imageAssets.map((asset: any, i: number) => (
                        <figure key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            overflow: 'hidden',
                            background: 'var(--bg-secondary)',
                            margin: 0
                        }}>
                            <img src={asset.gcs_url} alt={asset.prompt_used || `Generated image ${i + 1}`} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                            {asset.prompt_used && (
                                <figcaption style={{ padding: 8, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                                    {asset.prompt_used}
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            )}

            {/* Sections */}
            {sections.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layout size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Bullets & actions */}
            {(bullets.length > 0 || actions.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {bullets.length > 0 && (
                        <div style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={14} color="var(--primary)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Highlights</span>
                            </div>
                            {bullets.map((b, i) => (
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {b}</span>
                            ))}
                        </div>
                    )}
                    {actions.length > 0 && (
                        <div style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ListChecks size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                            </div>
                            {actions.map((a, i) => (
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {a}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
