import React from 'react';
import { Facebook, Clock, Hash, Target, TrendingUp, Image, Video } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const FacebookPostOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const sections = data.sections || [];

    const imageCount = posts.reduce((sum: number, p: any) => sum + (p.assets?.filter((a: any) => a.asset_type === 'image').length || 0), 0);
    const videoCount = posts.reduce((sum: number, p: any) => sum + (p.assets?.filter((a: any) => a.asset_type === 'video').length || 0), 0);

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
                    <Facebook size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Facebook — Post
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length} Post{posts.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {data.goal && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, color: '#1877F2',
                            background: 'rgba(24,119,242,0.1)', padding: '4px 10px', borderRadius: 99
                        }}>
                            <Target size={12} /> {data.goal}
                        </span>
                    )}
                    {data.campaign_stage && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, color: '#1877F2',
                            background: 'rgba(24,119,242,0.08)', padding: '4px 10px', borderRadius: 99
                        }}>
                            <TrendingUp size={12} /> {data.campaign_stage}
                        </span>
                    )}
                    {imageCount > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, color: '#1877F2',
                            background: 'rgba(24,119,242,0.1)', padding: '4px 10px', borderRadius: 99
                        }}>
                            <Image size={12} /> {imageCount}
                        </span>
                    )}
                    {videoCount > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, color: '#1877F2',
                            background: 'rgba(24,119,242,0.1)', padding: '4px 10px', borderRadius: 99
                        }}>
                            <Video size={12} /> {videoCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Posts */}
            {posts.map((post: any, idx: number) => {
                const wordCount = post.caption ? post.caption.split(/\s+/).filter(Boolean).length : 0;
                const postGoal = post.goal || data.goal;
                const postStage = post.campaign_stage || data.campaign_stage;

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Post header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(24,119,242,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Facebook size={14} color="#1877F2" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#1877F2', textTransform: 'uppercase' }}>
                                    Post {idx + 1}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {wordCount} word{wordCount !== 1 ? 's' : ''}
                                </span>
                                {postGoal && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, color: '#1877F2',
                                        background: 'rgba(24,119,242,0.08)',
                                        padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize'
                                    }}>
                                        {postGoal}
                                    </span>
                                )}
                                {postStage && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                                        background: 'var(--bg-primary)',
                                        padding: '2px 8px', borderRadius: 99
                                    }}>
                                        {postStage}
                                    </span>
                                )}
                            </div>
                            {post.posting_time_suggestion && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <Clock size={11} /> {post.posting_time_suggestion}
                                </span>
                            )}
                        </div>

                        {/* Caption */}
                        <div style={{ padding: 14 }}>
                            <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                                {post.caption}
                            </p>

                            {/* Hashtags */}
                            {post.hashtags?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                    {post.hashtags.map((h: string, i: number) => (
                                        <span key={i} style={{
                                            fontSize: 12, color: '#1877F2',
                                            background: 'rgba(24,119,242,0.1)',
                                            padding: '3px 8px', borderRadius: 6, fontWeight: 600
                                        }}>{h.startsWith('#') ? h : `#${h}`}</span>
                                    ))}
                                </div>
                            )}

                            {/* Media assets */}
                            {post.assets?.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
                                    {post.assets.map((asset: any, ai: number) => (
                                        <div key={ai} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', position: 'relative' }}>
                                            {asset.asset_type === 'video' ? (
                                                <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 120 }} />
                                            ) : (
                                                <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                                            )}
                                            <span style={{
                                                position: 'absolute', top: 4, right: 4,
                                                fontSize: 10, fontWeight: 700, color: '#fff',
                                                background: 'rgba(24,119,242,0.85)',
                                                padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase'
                                            }}>
                                                {asset.asset_type}
                                            </span>
                                        </div>
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
