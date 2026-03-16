import React from 'react';
import { Instagram, Clock, Hash, Video, Music, ListOrdered, Timer } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const InstagramReelOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const sections = data.sections || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(193,53,132,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Video size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Instagram — Reel
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length} Reel{posts.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
                {data.duration && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#C13584',
                        background: 'rgba(193,53,132,0.1)', padding: '4px 10px', borderRadius: 99
                    }}>
                        <Timer size={12} /> {data.duration}
                    </span>
                )}
                {data.audio_reference && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#833AB4',
                        background: 'rgba(131,58,180,0.1)', padding: '4px 10px', borderRadius: 99
                    }}>
                        <Music size={12} /> {data.audio_reference}
                    </span>
                )}
            </div>

            {/* Reels */}
            {posts.map((post: any, idx: number) => {
                const wordCount = post.caption ? post.caption.split(/\s+/).filter(Boolean).length : 0;
                const shotList = post.shot_list || data.shot_list || [];
                const audioPick = post.audio_reference || data.audio_reference;
                const dur = post.duration || data.duration;

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Post header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(193,53,132,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Instagram size={14} color="#C13584" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#C13584', textTransform: 'uppercase' }}>
                                    Reel {idx + 1}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {wordCount} word{wordCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {dur && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                                        <Timer size={11} /> {dur}
                                    </span>
                                )}
                                {post.posting_time_suggestion && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                                        <Clock size={11} /> {post.posting_time_suggestion}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Video assets — prominent */}
                            {post.assets?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {post.assets.filter((a: any) => a.asset_type === 'video').map((asset: any, ai: number) => (
                                        <div key={`v-${ai}`} style={{
                                            borderRadius: 10, overflow: 'hidden',
                                            border: '2px solid rgba(193,53,132,0.3)',
                                            background: '#000'
                                        }}>
                                            <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 280 }} />
                                        </div>
                                    ))}
                                    {post.assets.filter((a: any) => a.asset_type === 'image').length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
                                            {post.assets.filter((a: any) => a.asset_type === 'image').map((asset: any, ai: number) => (
                                                <div key={`i-${ai}`} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                                    <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 100, objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Audio reference */}
                            {audioPick && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 12px', borderRadius: 10,
                                    background: 'rgba(131,58,180,0.06)',
                                    border: '1px solid rgba(131,58,180,0.15)'
                                }}>
                                    <Music size={14} color="#833AB4" />
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{audioPick}</span>
                                </div>
                            )}

                            {/* Shot list */}
                            {shotList.length > 0 && (
                                <div style={{
                                    borderRadius: 10, border: '1px solid var(--border-default)',
                                    background: 'var(--bg-primary)', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        padding: '8px 12px', borderBottom: '1px solid var(--border-default)',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <ListOrdered size={13} color="#C13584" />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Shot List</span>
                                    </div>
                                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {shotList.map((shot: any, si: number) => (
                                            <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 800, color: '#C13584',
                                                    minWidth: 20, textAlign: 'center'
                                                }}>{si + 1}</span>
                                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                    {typeof shot === 'string' ? shot : shot.description || shot.shot || formatStructuredValue(shot)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Caption */}
                            {post.caption && (
                                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {post.caption}
                                </p>
                            )}

                            {/* Hashtags */}
                            {post.hashtags?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {post.hashtags.map((h: string, i: number) => (
                                        <span key={i} style={{
                                            fontSize: 12, color: '#C13584',
                                            background: 'rgba(193,53,132,0.1)',
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

