import React from 'react';
import { Facebook, Clock, Hash, MousePointerClick, Image, Megaphone, Eye } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const FacebookAdCopyOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const sections = data.sections || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(24,119,242,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Megaphone size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Facebook — Ad Copy
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length} Ad{posts.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
            </div>

            {/* Ad posts */}
            {posts.map((post: any, idx: number) => {
                const wordCount = post.caption ? post.caption.split(/\s+/).filter(Boolean).length : 0;
                const cta = post.cta || post.call_to_action || data.cta || data.call_to_action;
                const headline = post.headline || post.title;
                const description = post.description || post.link_description;

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Ad header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(24,119,242,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Facebook size={14} color="#1877F2" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#1877F2', textTransform: 'uppercase' }}>
                                    Ad {idx + 1}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {wordCount} word{wordCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {post.posting_time_suggestion && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <Clock size={11} /> {post.posting_time_suggestion}
                                </span>
                            )}
                        </div>

                        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Image-focused media */}
                            {post.assets?.length > 0 && (
                                <div style={{
                                    borderRadius: 10, overflow: 'hidden',
                                    border: '1px solid var(--border-default)'
                                }}>
                                    {post.assets.filter((a: any) => a.asset_type === 'image').length > 0 && (
                                        <img
                                            src={post.assets.find((a: any) => a.asset_type === 'image')?.gcs_url}
                                            alt=""
                                            style={{ width: '100%', display: 'block', maxHeight: 250, objectFit: 'cover' }}
                                        />
                                    )}
                                    {/* Headline + link description bar (like FB ad preview) */}
                                    {(headline || description) && (
                                        <div style={{
                                            padding: '10px 12px',
                                            background: 'var(--bg-primary)',
                                            borderTop: '1px solid var(--border-default)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                {headline && (
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                                        {headline}
                                                    </div>
                                                )}
                                                {description && (
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                        {description}
                                                    </div>
                                                )}
                                            </div>
                                            {cta && (
                                                <div style={{
                                                    padding: '6px 14px', borderRadius: 6,
                                                    background: '#1877F2', color: '#fff',
                                                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                                                    display: 'inline-flex', alignItems: 'center', gap: 4
                                                }}>
                                                    <MousePointerClick size={12} /> {cta}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Caption / primary text */}
                            {post.caption && (
                                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {post.caption}
                                </p>
                            )}

                            {/* CTA button (if no assets to attach it to) */}
                            {cta && !(post.assets?.length > 0) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        padding: '8px 18px', borderRadius: 6,
                                        background: '#1877F2', color: '#fff',
                                        fontSize: 13, fontWeight: 700,
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        cursor: 'default'
                                    }}>
                                        <MousePointerClick size={14} /> {cta}
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>CTA Preview</span>
                                </div>
                            )}

                            {/* Headline (if no assets section) */}
                            {headline && !(post.assets?.length > 0) && (
                                <div style={{
                                    padding: '10px 12px', borderRadius: 8,
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-default)'
                                }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase' }}>Headline</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                        {headline}
                                    </div>
                                    {description && (
                                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                                            {description}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Additional image assets grid */}
                            {post.assets?.filter((a: any) => a.asset_type === 'image').length > 1 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
                                    {post.assets.filter((a: any) => a.asset_type === 'image').slice(1).map((asset: any, ai: number) => (
                                        <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                            <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 100, objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Video assets */}
                            {post.assets?.filter((a: any) => a.asset_type === 'video').length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {post.assets.filter((a: any) => a.asset_type === 'video').map((asset: any, ai: number) => (
                                        <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                            <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 200 }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Hashtags */}
                            {post.hashtags?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {post.hashtags.map((h: string, i: number) => (
                                        <span key={i} style={{
                                            fontSize: 12, color: '#1877F2',
                                            background: 'rgba(24,119,242,0.1)',
                                            padding: '3px 8px', borderRadius: 6, fontWeight: 600
                                        }}>{h.startsWith('#') ? h : `#${h}`}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Fallback: sections */}
            {posts.length === 0 && sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
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
