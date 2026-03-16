import React from 'react';
import { Mic, Headphones, Hash, FileText, Layout, Sparkles } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const PodcastScriptOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const hasSegments = data.script_segments && data.script_segments.length > 0;
    const hasSeoTags = data.seo_tags && data.seo_tags.length > 0;
    const hasAudioAssets = data.audio_assets && data.audio_assets.length > 0;
    const hasSections = data.sections && data.sections.length > 0;
    const hasRecommendations = data.recommendations && data.recommendations.length > 0;

    const hasAgentFields = hasSegments || data.show_notes || hasSeoTags || hasAudioAssets;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Mic size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Podcast Script
                    </span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Script Segments Timeline */}
            {hasSegments && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Script Timeline
                    </div>
                    {data.script_segments.map((seg: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', gap: 12
                        }}>
                            <div style={{
                                minWidth: 60, padding: '4px 8px', borderRadius: 8,
                                background: 'rgba(124,92,255,0.1)', textAlign: 'center',
                                fontSize: 11, fontWeight: 700, color: 'var(--accent-1)'
                            }}>
                                {seg.time || `${i}:00`}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{seg.speaker || 'Host'}</span>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{seg.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Show Notes */}
            {data.show_notes && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Show Notes</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.show_notes}</span>
                </div>
            )}

            {/* SEO Tags */}
            {hasSeoTags && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Hash size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>SEO Tags</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {data.seo_tags.map((tag: string, i: number) => (
                            <span key={i} style={{
                                fontSize: 11, padding: '4px 10px', borderRadius: 999,
                                background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.18)',
                                color: 'var(--accent-1)', fontWeight: 600
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Audio Player */}
            {hasAudioAssets && (
                <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Headphones size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Generated Audio</span>
                    </div>
                    {data.audio_assets.map((asset: any, i: number) => (
                        <audio key={i} controls style={{ width: '100%', marginTop: 8 }} src={asset.gcs_url || asset.url} />
                    ))}
                </div>
            )}

            {/* Fallback: Sections */}
            {!hasAgentFields && hasSections && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {data.sections.map((s: any, i: number) => (
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

            {/* Fallback: Recommendations */}
            {!hasAgentFields && hasRecommendations && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {data.recommendations.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>&#8226; {r}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
