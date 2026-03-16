import React from 'react';
import { ImageIcon, Clock, Bookmark } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const PinterestPinOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];

    // Fallback to sections if no posts
    const sections = data.sections || [];
    if (posts.length === 0 && sections.length === 0 && !data.title) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(230,0,35,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pinterest — Pin</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length > 0 ? `${posts.length} Pin${posts.length !== 1 ? 's' : ''} Generated` : data.title || 'Pinterest Pin'}
                    </span>
                </div>
            </div>

            {/* Pin cards — visual-first layout */}
            {posts.length > 0 && posts.map((post: any, idx: number) => (
                <div key={idx} style={{
                    border: '1px solid var(--border-default)', borderRadius: 14,
                    background: 'var(--bg-secondary)', overflow: 'hidden'
                }}>
                    {/* Large image area first (visual-first) */}
                    {post.assets?.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: post.assets.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
                            {post.assets.map((asset: any, ai: number) => (
                                <div key={ai} style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-default)' }}>
                                    {asset.asset_type === 'video' ? (
                                        <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
                                    ) : (
                                        <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, rgba(230,0,35,0.12), rgba(0,0,0,0.02))',
                        borderBottom: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bookmark size={13} color="var(--primary)" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                Pin {idx + 1}
                            </span>
                        </div>
                        {post.posting_time_suggestion && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={11} /> Best time: {post.posting_time_suggestion}
                            </span>
                        )}
                    </div>

                    <div style={{ padding: 14 }}>
                        {/* Pin title prominently */}
                        {(post.pin_title || post.headline || post.title) && (
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                                {post.pin_title || post.headline || post.title}
                            </div>
                        )}
                        <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                            {post.caption || post.description}
                        </p>

                        {/* Board suggestion */}
                        {post.board_suggestion && (
                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Bookmark size={13} color="var(--text-muted)" />
                                <span style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                                    padding: '3px 10px', borderRadius: 20,
                                    background: 'rgba(230,0,35,0.08)',
                                    border: '1px solid rgba(230,0,35,0.2)'
                                }}>{post.board_suggestion}</span>
                            </div>
                        )}

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

                        {/* Image prompts preview */}
                        {post.image_prompts?.length > 0 && (
                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Image Prompts</span>
                                {post.image_prompts.map((p: string, pi: number) => (
                                    <span key={pi} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                                        {pi + 1}. {p}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Fallback sections */}
            {posts.length === 0 && sections.length > 0 && sections.map((s: any, i: number) => (
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
