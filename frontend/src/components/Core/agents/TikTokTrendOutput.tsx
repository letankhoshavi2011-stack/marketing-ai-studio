import React from 'react';
import { TrendingUp, Clock, Sparkles, Lightbulb } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const TikTokTrendOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];

    // Trend-specific data
    const trends = data.trends || data.trending_elements || [];
    const adaptations = data.adaptations || data.adaptation_suggestions || [];

    // Fallback to sections if no posts and no trends
    const sections = data.sections || [];
    if (posts.length === 0 && trends.length === 0 && sections.length === 0 && !data.title) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(0,242,234,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TikTok — Trend Analysis</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {trends.length > 0
                            ? `${trends.length} Trend${trends.length !== 1 ? 's' : ''} Identified`
                            : posts.length > 0
                                ? `${posts.length} Post${posts.length !== 1 ? 's' : ''} Generated`
                                : data.title || 'TikTok Trends'}
                    </span>
                </div>
            </div>

            {/* Trending elements as cards */}
            {trends.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {trends.map((trend: any, idx: number) => {
                        const trendName = typeof trend === 'string' ? trend : (trend.name || trend.title || trend.trend || `Trend ${idx + 1}`);
                        const trendDesc = typeof trend === 'string' ? null : (trend.description || trend.details || trend.explanation);
                        const trendCategory = typeof trend === 'string' ? null : (trend.category || trend.type);
                        const trendPotential = typeof trend === 'string' ? null : (trend.potential || trend.virality || trend.engagement_potential);

                        return (
                            <div key={idx} style={{
                                border: '1px solid var(--border-default)', borderRadius: 12,
                                background: 'var(--bg-secondary)', overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '8px 12px',
                                    background: 'linear-gradient(135deg, rgba(0,242,234,0.08), rgba(0,0,0,0.02))',
                                    borderBottom: '1px solid var(--border-default)',
                                    display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                    <TrendingUp size={13} color="rgba(0,242,234,0.8)" />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        Trend {idx + 1}
                                    </span>
                                    {trendCategory && (
                                        <span style={{
                                            marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 10,
                                            background: 'rgba(0,242,234,0.1)',
                                            border: '1px solid rgba(0,242,234,0.2)',
                                            color: 'var(--text-muted)', textTransform: 'capitalize'
                                        }}>{trendCategory}</span>
                                    )}
                                </div>
                                <div style={{ padding: 12 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                        {trendName}
                                    </div>
                                    {trendDesc && (
                                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                                            {trendDesc}
                                        </p>
                                    )}
                                    {trendPotential && (
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Sparkles size={12} color="rgba(0,242,234,0.7)" />
                                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                                                Potential: {trendPotential}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Adaptation suggestions */}
            {adaptations.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    background: 'var(--bg-secondary)', overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, rgba(0,242,234,0.06), rgba(0,0,0,0.01))',
                        borderBottom: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Lightbulb size={14} color="rgba(0,242,234,0.8)" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Adaptation Suggestions</span>
                    </div>
                    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {adaptations.map((a: any, ai: number) => {
                            const text = typeof a === 'string' ? a : (a.suggestion || a.description || a.content || '');
                            const title = typeof a === 'string' ? null : (a.title || a.name);
                            return (
                                <div key={ai} style={{
                                    padding: '10px 12px', borderRadius: 8,
                                    background: 'rgba(0,242,234,0.04)',
                                    border: '1px solid rgba(0,242,234,0.12)',
                                    display: 'flex', gap: 10, alignItems: 'flex-start'
                                }}>
                                    <span style={{
                                        minWidth: 22, height: 22, borderRadius: 11,
                                        background: 'rgba(0,242,234,0.15)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0
                                    }}>{ai + 1}</span>
                                    <div>
                                        {title && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>}
                                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{text}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Posts if present */}
            {posts.length > 0 && posts.map((post: any, idx: number) => (
                <div key={idx} style={{
                    border: '1px solid var(--border-default)', borderRadius: 14,
                    background: 'var(--bg-secondary)', overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, rgba(0,242,234,0.12), rgba(0,0,0,0.02))',
                        borderBottom: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                            Post {idx + 1}
                        </span>
                        {post.posting_time_suggestion && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={11} /> Best time: {post.posting_time_suggestion}
                            </span>
                        )}
                    </div>
                    <div style={{ padding: 14 }}>
                        <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                            {post.caption}
                        </p>
                        {post.hashtags?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                {post.hashtags.map((h: string, i: number) => (
                                    <span key={i} style={{
                                        fontSize: 12, color: 'var(--primary)',
                                        background: 'rgba(124,92,255,0.1)',
                                        padding: '3px 8px', borderRadius: 6, fontWeight: 600
                                    }}>{h.startsWith('#') ? h : `#${h}`}</span>
                                ))}
                            </div>
                        )}
                        {post.assets?.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
                                {post.assets.map((asset: any, ai: number) => (
                                    <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                        {asset.asset_type === 'video' ? (
                                            <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 120 }} />
                                        ) : (
                                            <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Fallback sections */}
            {posts.length === 0 && trends.length === 0 && sections.length > 0 && sections.map((s: any, i: number) => (
                <div key={i} style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    {s.heading && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading}</span>}
                    {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{s.content}</span>}
                </div>
            ))}
        </div>
    );
};
