import React from 'react';
import { Type, Clock, Sparkles, Layout, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

const formatTimeMmSs = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const CaptionGeneratorOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const captionSegments = data.caption_segments || [];
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = captionSegments.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Type size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Caption Generator</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
                {captionSegments.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{captionSegments.length} segments</span>
                )}
            </div>

            {/* Caption Timeline */}
            {captionSegments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {captionSegments.map((seg: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', gap: 10, alignItems: 'flex-start'
                        }}>
                            {/* Time badge */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: 'var(--accent-1)',
                                    fontFamily: 'monospace', padding: '3px 8px', borderRadius: 6,
                                    background: 'rgba(124,92,255,0.10)',
                                    textAlign: 'center', whiteSpace: 'nowrap'
                                }}>
                                    {seg.start_time != null ? formatTimeMmSs(seg.start_time) : '00:00'}
                                </span>
                                {seg.end_time != null && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                                        fontFamily: 'monospace', padding: '3px 8px', borderRadius: 6,
                                        textAlign: 'center', whiteSpace: 'nowrap'
                                    }}>
                                        {formatTimeMmSs(seg.end_time)}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{seg.text}</span>
                                {seg.visual_style && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color: 'var(--accent-1)',
                                        padding: '2px 8px', borderRadius: 999,
                                        background: 'rgba(124,92,255,0.10)',
                                        border: '1px solid rgba(124,92,255,0.2)',
                                        alignSelf: 'flex-start'
                                    }}>{seg.visual_style}</span>
                                )}
                            </div>

                            {/* Duration */}
                            {seg.start_time != null && seg.end_time != null && (
                                <span style={{
                                    fontSize: 11, color: 'var(--text-muted)',
                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                    flexShrink: 0
                                }}>
                                    <Clock size={11} /> {(seg.end_time - seg.start_time).toFixed(1)}s
                                </span>
                            )}
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

