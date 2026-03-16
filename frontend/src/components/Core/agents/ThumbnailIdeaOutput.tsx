import React from 'react';
import { ImageIcon, Sparkles, Layout, ListChecks, Palette, Smile } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const ThumbnailIdeaOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const concepts = data.thumbnail_concepts || [];
    const assets = data.assets || [];
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = concepts.length > 0 || assets.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Thumbnail Ideas</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
                {concepts.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{concepts.length} concepts</span>
                )}
            </div>

            {/* Generated Thumbnails */}
            {assets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ImageIcon size={14} color="var(--accent-1)" /> Generated Thumbnails
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 160 : 220}px, 1fr))`, gap: 10 }}>
                        {assets.map((asset: any, i: number) => (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)', borderRadius: 12,
                                overflow: 'hidden', background: 'var(--bg-secondary)'
                            }}>
                                {(() => {
                                    const assetUrl = asset.gcs_url || asset.thumbnail_url || asset.url;
                                    return assetUrl ? (
                                        <img src={assetUrl} alt={`Thumbnail ${i + 1}`} style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                                    ) : null;
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Concept Cards */}
            {concepts.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? 240 : 280}px, 1fr))`, gap: compact ? 10 : 12 }}>
                    {concepts.map((c: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 14, background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            {/* Concept title */}
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                                Concept {i + 1}
                            </span>

                            {/* Concept description */}
                            {c.concept && (
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.concept}</span>
                            )}

                            {/* Text Overlay Preview */}
                            {c.text_overlay && (
                                <div style={{
                                    padding: '10px 14px', borderRadius: 8,
                                    background: 'rgba(249,115,22,0.08)',
                                    border: '1px solid rgba(249,115,22,0.2)',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                                        {c.text_overlay}
                                    </span>
                                </div>
                            )}

                            {/* AI Prompt */}
                            {c.ai_prompt && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Prompt</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>{c.ai_prompt}</span>
                                </div>
                            )}

                            {/* Tags: emotion + color_scheme */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {c.emotion && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                                        background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.2)',
                                        color: 'var(--accent-1)', display: 'inline-flex', alignItems: 'center', gap: 4
                                    }}>
                                        <Smile size={11} /> {c.emotion}
                                    </span>
                                )}
                                {c.color_scheme && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                                        background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)',
                                        color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4
                                    }}>
                                        <Palette size={11} /> {c.color_scheme}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback: sections */}
            {!hasSpecificFields && sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: compact ? 10 : 12 }}>
                    {sections.map((s: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
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

            {/* Fallback: recommendations */}
            {!hasSpecificFields && recommendations.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {recommendations.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof r === 'string' ? r : formatStructuredValue(r)}</span>
                    ))}
                </div>
            )}

            {/* Fallback: action_items */}
            {!hasSpecificFields && actionItems.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                    </div>
                    {actionItems.map((a: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof a === 'string' ? a : formatStructuredValue(a)}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

