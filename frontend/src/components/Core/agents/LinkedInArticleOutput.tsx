import React from 'react';
import { Linkedin, Clock, Hash, BookOpen, Briefcase, AlignLeft, Type } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const LinkedInArticleOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const sections = data.sections || [];
    const articleContent = data.article_content || data.content || data.body;
    const articleTitle = data.article_title || data.title;
    const articleSubtitle = data.subtitle || data.summary;

    // For articles, we may have structured sections in the article itself
    const articleSections = data.article_sections || [];

    // Word count for the article
    const totalWords = articleContent
        ? articleContent.split(/\s+/).filter(Boolean).length
        : posts.reduce((sum: number, p: any) => sum + (p.caption ? p.caption.split(/\s+/).filter(Boolean).length : 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(0,119,181,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <BookOpen size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        LinkedIn — Article
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {articleContent ? 'Long-Form Article' : `${posts.length} Post${posts.length !== 1 ? 's' : ''}`} Generated
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: '#0077B5',
                        background: 'rgba(0,119,181,0.1)', padding: '4px 10px', borderRadius: 99
                    }}>
                        <Briefcase size={12} /> Professional
                    </span>
                    {totalWords > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, color: '#0077B5',
                            background: 'rgba(0,119,181,0.08)', padding: '4px 10px', borderRadius: 99
                        }}>
                            <AlignLeft size={12} /> {totalWords} words
                        </span>
                    )}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                        background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: 99,
                        border: '1px solid var(--border-default)'
                    }}>
                        <Type size={12} /> Text Only
                    </span>
                </div>
            </div>

            {/* Article content — long-form display */}
            {articleContent && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 14,
                    background: 'var(--bg-secondary)', overflow: 'hidden'
                }}>
                    {/* Article title bar */}
                    {articleTitle && (
                        <div style={{
                            padding: '16px 20px 8px',
                            borderBottom: articleSubtitle ? 'none' : '1px solid var(--border-default)'
                        }}>
                            <h2 style={{
                                fontSize: 20, fontWeight: 800, color: 'var(--text-primary)',
                                lineHeight: 1.3, margin: 0,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}>
                                {articleTitle}
                            </h2>
                        </div>
                    )}
                    {articleSubtitle && (
                        <div style={{
                            padding: '4px 20px 12px',
                            borderBottom: '1px solid var(--border-default)'
                        }}>
                            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {articleSubtitle}
                            </span>
                        </div>
                    )}

                    {/* Article body */}
                    <div style={{ padding: '16px 20px 20px' }}>
                        <div style={{
                            fontSize: 14, color: 'var(--text-primary)',
                            lineHeight: 1.8, whiteSpace: 'pre-wrap',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                            {articleContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Article sections (if provided as structured data) */}
            {articleSections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {articleSections.map((sec: any, si: number) => (
                        <div key={si} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            background: 'var(--bg-secondary)', overflow: 'hidden'
                        }}>
                            {(sec.heading || sec.title) && (
                                <div style={{
                                    padding: '10px 16px',
                                    borderBottom: '1px solid var(--border-default)',
                                    background: 'rgba(0,119,181,0.04)'
                                }}>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {sec.heading || sec.title}
                                    </span>
                                </div>
                            )}
                            <div style={{ padding: '12px 16px' }}>
                                <p style={{
                                    fontSize: 13.5, color: 'var(--text-secondary)',
                                    lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0
                                }}>
                                    {sec.content || sec.body || sec.text || ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Posts fallback (if article_content not available) */}
            {!articleContent && posts.map((post: any, idx: number) => {
                const wordCount = post.caption ? post.caption.split(/\s+/).filter(Boolean).length : 0;

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Post header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(0,119,181,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Linkedin size={14} color="#0077B5" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#0077B5', textTransform: 'uppercase' }}>
                                    Article {idx + 1}
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

                        {/* Article body from caption */}
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{
                                fontSize: 14, color: 'var(--text-primary)',
                                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}>
                                {post.caption}
                            </div>
                        </div>

                        {/* Hashtags */}
                        {post.hashtags?.length > 0 && (
                            <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {post.hashtags.map((h: string, i: number) => (
                                    <span key={i} style={{
                                        fontSize: 12, color: '#0077B5',
                                        background: 'rgba(0,119,181,0.08)',
                                        padding: '3px 8px', borderRadius: 6, fontWeight: 600
                                    }}>{h.startsWith('#') ? h : `#${h}`}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Fallback: generic sections */}
            {!articleContent && posts.length === 0 && sections.length > 0 && (
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
