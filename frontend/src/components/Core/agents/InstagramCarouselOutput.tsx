import React from 'react';
import { Instagram, Clock, Hash, Layers, Target, ChevronRight } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const InstagramCarouselOutput: React.FC<Props> = ({ data, compact = false }) => {
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
                    <Layers size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Instagram — Carousel
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {posts.length} Carousel{posts.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
                {data.slide_count && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#E1306C',
                        background: 'rgba(225,48,108,0.1)', padding: '4px 10px', borderRadius: 99
                    }}>
                        <Layers size={12} /> {data.slide_count} Slide{data.slide_count !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Carousel posts */}
            {posts.map((post: any, idx: number) => {
                const wordCount = post.caption ? post.caption.split(/\s+/).filter(Boolean).length : 0;
                const slides = post.slides || post.carousel_slides || [];
                const slideCount = post.slide_count || data.slide_count || slides.length;

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Post header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Instagram size={14} color="#E1306C" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#E1306C', textTransform: 'uppercase' }}>
                                    Carousel {idx + 1}
                                </span>
                                {slideCount > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, color: '#fff',
                                        background: '#E1306C', padding: '2px 7px', borderRadius: 99
                                    }}>
                                        {slideCount} slides
                                    </span>
                                )}
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
                            {/* Slides as numbered cards */}
                            {slides.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {slides.map((slide: any, si: number) => (
                                        <div key={si} style={{
                                            border: '1px solid var(--border-default)', borderRadius: 10,
                                            background: 'var(--bg-primary)', overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                padding: '7px 12px',
                                                borderBottom: '1px solid var(--border-default)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                background: 'rgba(225,48,108,0.04)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #E1306C, #C13584)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 10, fontWeight: 800, color: '#fff'
                                                    }}>
                                                        {si + 1}
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        Slide {si + 1}
                                                    </span>
                                                </div>
                                                {(slide.slide_goal || slide.goal) && (
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 600, color: '#C13584',
                                                        background: 'rgba(193,53,132,0.08)',
                                                        padding: '2px 8px', borderRadius: 99
                                                    }}>
                                                        <Target size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                                                        {slide.slide_goal || slide.goal}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ padding: '10px 12px' }}>
                                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: 0 }}>
                                                    {typeof slide === 'string' ? slide : slide.content || slide.text || slide.caption || formatStructuredValue(slide)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Media assets */}
                            {post.assets?.length > 0 && (
                                <div style={{
                                    display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4
                                }}>
                                    {post.assets.map((asset: any, ai: number) => (
                                        <div key={ai} style={{
                                            flex: '0 0 auto', minWidth: 130, maxWidth: 160,
                                            borderRadius: 8, overflow: 'hidden',
                                            border: '1px solid var(--border-default)', position: 'relative'
                                        }}>
                                            {asset.asset_type === 'video' ? (
                                                <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', maxHeight: 120 }} />
                                            ) : (
                                                <img src={asset.gcs_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 120, objectFit: 'cover' }} />
                                            )}
                                            <span style={{
                                                position: 'absolute', bottom: 4, left: 4,
                                                fontSize: 10, fontWeight: 700, color: '#fff',
                                                background: 'rgba(225,48,108,0.85)',
                                                padding: '2px 6px', borderRadius: 4
                                            }}>
                                                {ai + 1}/{post.assets.length}
                                            </span>
                                        </div>
                                    ))}
                                    {post.assets.length > 1 && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            minWidth: 32, color: 'var(--text-muted)'
                                        }}>
                                            <ChevronRight size={16} />
                                        </div>
                                    )}
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
                                            fontSize: 12, color: '#E1306C',
                                            background: 'rgba(225,48,108,0.1)',
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

