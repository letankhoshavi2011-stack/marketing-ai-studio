import React from 'react';
import { Instagram, Clock, Hash, Smartphone, MousePointerClick, Layers } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const InstagramStoryOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const sections = data.sections || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Smartphone size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Instagram — Story
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length} Story Frame{posts.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
                {data.frame_count && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#E1306C',
                        background: 'rgba(225,48,108,0.1)', padding: '4px 10px', borderRadius: 99
                    }}>
                        <Layers size={12} /> {data.frame_count} Frame{data.frame_count !== 1 ? 's' : ''}
                    </span>
                )}
                {data.sticker_cta && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#fff',
                        background: 'linear-gradient(135deg, #E1306C, #C13584)',
                        padding: '4px 12px', borderRadius: 99
                    }}>
                        <MousePointerClick size={12} /> {data.sticker_cta}
                    </span>
                )}
            </div>

            {/* Story Frames — horizontal scroll */}
            {posts.length > 0 && (
                <div style={{
                    display: 'flex', gap: 12, overflowX: 'auto',
                    paddingBottom: 8, scrollSnapType: 'x mandatory'
                }}>
                    {posts.map((post: any, idx: number) => (
                        <div key={idx} style={{
                            minWidth: 220, maxWidth: 260, flex: '0 0 auto',
                            border: '1px solid var(--border-default)', borderRadius: 14,
                            background: 'var(--bg-secondary)', overflow: 'hidden',
                            scrollSnapAlign: 'start'
                        }}>
                            {/* Frame header */}
                            <div style={{
                                padding: '10px 14px',
                                background: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(0,0,0,0.02))',
                                borderBottom: '1px solid var(--border-default)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #E1306C, #C13584)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 800, color: '#fff'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#E1306C', textTransform: 'uppercase' }}>
                                        Frame {idx + 1}
                                    </span>
                                </div>
                                {post.posting_time_suggestion && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                                        <Clock size={10} /> {post.posting_time_suggestion}
                                    </span>
                                )}
                            </div>

                            {/* Media first for story */}
                            {post.assets?.length > 0 && (
                                <div style={{ padding: 8 }}>
                                    {post.assets.map((asset: any, ai: number) => (
                                        <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', marginBottom: ai < post.assets.length - 1 ? 6 : 0 }}>
                                            {asset.asset_type === 'video' ? (
                                                <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 160 }} />
                                            ) : (
                                                <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Caption */}
                            {post.caption && (
                                <div style={{ padding: '8px 14px 14px' }}>
                                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {post.caption}
                                    </p>
                                </div>
                            )}

                            {/* Sticker CTA on individual post */}
                            {post.sticker_cta && (
                                <div style={{ padding: '0 14px 12px' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, fontWeight: 700, color: '#fff',
                                        background: 'linear-gradient(135deg, #E1306C, #C13584)',
                                        padding: '4px 12px', borderRadius: 99
                                    }}>
                                        <MousePointerClick size={11} /> {post.sticker_cta}
                                    </span>
                                </div>
                            )}

                            {/* Hashtags */}
                            {post.hashtags?.length > 0 && (
                                <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {post.hashtags.map((h: string, i: number) => (
                                        <span key={i} style={{
                                            fontSize: 11, color: '#E1306C',
                                            background: 'rgba(225,48,108,0.1)',
                                            padding: '2px 6px', borderRadius: 5, fontWeight: 600
                                        }}>{h.startsWith('#') ? h : `#${h}`}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback: sections */}
            {posts.length === 0 && sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.title && (
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>
                    )}
                    {sections.map((s: any, i: number) => (
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
            )}
        </div>
    );
};
