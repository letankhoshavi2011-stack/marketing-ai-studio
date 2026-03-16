import React from 'react';
import { Film, Clock, Target, Sparkles, Layout, ListChecks, Image } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const VideoAdScriptOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const scenes = data.scenes || [];
    const assets = data.assets || [];
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = data.hook || scenes.length > 0 || data.cta;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Film size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Video Ad Script</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Hook */}
            {data.hook && (
                <div style={{
                    border: '1px solid rgba(56,189,248,0.3)', borderRadius: 12,
                    padding: compact ? 10 : 14, background: 'rgba(56,189,248,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Hook</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{data.hook}</span>
                </div>
            )}

            {/* Scene Timeline */}
            {scenes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Layout size={14} color="var(--accent-1)" /> Scene Timeline
                    </span>
                    {scenes.map((s: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', gap: 10
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 9,
                                background: 'rgba(56,189,248,0.12)',
                                border: '1px solid rgba(56,189,248,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: 'var(--accent-1)',
                                flexShrink: 0
                            }}>{s.scene_number || i + 1}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                {s.visual_description && (
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>Visual:</strong> {s.visual_description}
                                    </span>
                                )}
                                {s.audio_voiceover && (
                                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>VO:</strong> {s.audio_voiceover}
                                    </span>
                                )}
                                {s.on_screen_text && (
                                    <span style={{ fontSize: 12, color: 'var(--accent-1)', fontStyle: 'italic' }}>
                                        On-screen: "{s.on_screen_text}"
                                    </span>
                                )}
                                {s.duration_seconds && (
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={11} /> {s.duration_seconds}s
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            {data.cta && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Call to Action</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{data.cta}</span>
                </div>
            )}

            {/* SEO Description */}
            {data.seo_description && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>SEO Description</span>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{data.seo_description}</span>
                </div>
            )}

            {/* Assets */}
            {assets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Image size={14} color="var(--accent-1)" /> Media Assets
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                        {assets.map((asset: any, i: number) => (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)', borderRadius: 12,
                                overflow: 'hidden', background: 'var(--bg-secondary)'
                            }}>
                                {asset.gcs_url && asset.asset_type === 'video' ? (
                                    <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block' }} />
                                ) : asset.gcs_url ? (
                                    <img src={asset.gcs_url} alt={`Asset ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                                ) : null}
                            </div>
                        ))}
                    </div>
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

