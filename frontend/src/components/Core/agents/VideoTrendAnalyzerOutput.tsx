import React from 'react';
import { TrendingUp, Sparkles, Layout, ListChecks, Play, Lightbulb } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const VideoTrendAnalyzerOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const trendingFormats = data.trending_formats || [];
    const videoConcepts = data.video_concepts || [];
    const recommendationsList = data.recommendations || [];
    const sections = data.sections || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = data.trend_report || trendingFormats.length > 0 || videoConcepts.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Video Trend Analysis</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Trend Report */}
            {data.trend_report && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 14, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Trend Report</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.trend_report}</span>
                </div>
            )}

            {/* Trending Formats as pills */}
            {trendingFormats.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Trending Formats</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {trendingFormats.map((fmt: string, i: number) => (
                            <span key={i} style={{
                                fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                                background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
                                color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 5
                            }}>
                                <TrendingUp size={12} color="#22c55e" />
                                {typeof fmt === 'string' ? fmt : formatStructuredValue(fmt)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Concepts */}
            {videoConcepts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Play size={14} color="var(--accent-1)" /> Video Concepts
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? 240 : 280}px, 1fr))`, gap: compact ? 10 : 12 }}>
                        {videoConcepts.map((vc: any, i: number) => (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)', borderRadius: 12,
                                padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                                display: 'flex', flexDirection: 'column', gap: 6
                            }}>
                                {vc.title && (
                                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{vc.title}</span>
                                )}
                                {vc.hook && (
                                    <div style={{
                                        padding: '6px 10px', borderRadius: 8,
                                        background: 'rgba(34,197,94,0.06)',
                                        border: '1px solid rgba(34,197,94,0.15)'
                                    }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-1)' }}>Hook: </span>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{vc.hook}</span>
                                    </div>
                                )}
                                {vc.description && (
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{vc.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendationsList.length > 0 && hasSpecificFields && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lightbulb size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {recommendationsList.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof r === 'string' ? r : formatStructuredValue(r)}</span>
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

            {/* Fallback: recommendations (only when no specific fields) */}
            {!hasSpecificFields && recommendationsList.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {recommendationsList.map((r: string, i: number) => (
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

