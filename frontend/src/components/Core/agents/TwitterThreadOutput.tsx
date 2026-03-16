import React from 'react';
import { GitMerge, Clock } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const TwitterThreadOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const tweets = data.tweets || [];
    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    // If we have tweets but no posts, convert tweets to post-like objects
    const items = posts.length > 0 ? posts : tweets.map((t: string, i: number) => ({
        caption: t, hashtags: [], posting_time_suggestion: '', post_index: i, assets: []
    }));

    // Fallback to sections if no items
    const sections = data.sections || [];
    const topLevelAssets = Array.isArray(data.assets) ? data.assets : [];
    const hasPostAssets = items.some((post: any) => Array.isArray(post.assets) && post.assets.length > 0);
    if (items.length === 0 && sections.length === 0 && !data.title) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(29,155,240,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitMerge size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Twitter / X — Thread</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {items.length > 0 ? `${items.length} Tweet${items.length !== 1 ? 's' : ''} in Thread` : data.title || 'Twitter Thread'}
                    </span>
                </div>
            </div>

            {/* Thread with connecting vertical line */}
            {items.length > 0 && (
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                    <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'rgba(29,155,240,0.3)' }} />
                    {items.map((post: any, idx: number) => {
                        const text = post.caption || '';
                        const charCount = text.length;
                        const overLimit = charCount > 280;

                        return (
                            <div key={idx} style={{
                                position: 'relative',
                                marginBottom: idx < items.length - 1 ? 12 : 0
                            }}>
                                {/* Thread index dot */}
                                <div style={{
                                    position: 'absolute', left: -20, top: 14,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: 'rgba(29,155,240,0.2)',
                                    border: '2px solid rgba(29,155,240,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                                    zIndex: 1
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{
                                    border: '1px solid var(--border-default)', borderRadius: 14,
                                    background: 'var(--bg-secondary)', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: 'linear-gradient(135deg, rgba(29,155,240,0.12), rgba(0,0,0,0.02))',
                                        borderBottom: '1px solid var(--border-default)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                            Tweet {idx + 1}/{items.length}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700,
                                                padding: '2px 8px', borderRadius: 10,
                                                background: overLimit ? 'rgba(239,68,68,0.15)' : 'rgba(29,155,240,0.12)',
                                                color: overLimit ? '#ef4444' : 'var(--text-muted)',
                                                border: `1px solid ${overLimit ? 'rgba(239,68,68,0.3)' : 'rgba(29,155,240,0.25)'}`
                                            }}>
                                                {charCount}/280
                                            </span>
                                            {post.posting_time_suggestion && (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={11} /> {post.posting_time_suggestion}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ padding: 14 }}>
                                        <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                                            {text}
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
                                                {post.assets.map((asset: any, ai: number) => {
                                                    const assetUrl = asset?.gcs_url || asset?.thumbnail_url || asset?.url || '';
                                                    if (!assetUrl) return null;
                                                    return (
                                                        <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                                            {asset.asset_type === 'video' ? (
                                                                <video src={assetUrl} controls style={{ width: '100%', display: 'block', maxHeight: 120 }} />
                                                            ) : (
                                                                <img src={assetUrl} alt="" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!hasPostAssets && topLevelAssets.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 14,
                    background: 'var(--bg-secondary)', padding: 12
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
                        Generated Assets
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                        {topLevelAssets.map((asset: any, i: number) => {
                            const assetUrl = asset?.gcs_url || asset?.thumbnail_url || asset?.url || '';
                            if (!assetUrl) return null;
                            return (
                                <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                    {asset.asset_type === 'video' ? (
                                        <video src={assetUrl} controls style={{ width: '100%', display: 'block', maxHeight: 120 }} />
                                    ) : (
                                        <img src={assetUrl} alt="" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Fallback sections */}
            {items.length === 0 && sections.length > 0 && sections.map((s: any, i: number) => (
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
