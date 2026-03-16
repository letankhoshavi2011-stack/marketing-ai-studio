import React from 'react';
import { MessageCircle, FileText, Hash, Tag, Layout, Sparkles } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const PodcastDescriptionOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const hasSeoTags = data.seo_tags && data.seo_tags.length > 0;
    const hasKeyTopics = data.key_topics && data.key_topics.length > 0;
    const hasSections = data.sections && data.sections.length > 0;
    const hasRecommendations = data.recommendations && data.recommendations.length > 0;

    const hasAgentFields = data.description || data.show_notes || data.episode_title || hasSeoTags || hasKeyTopics;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <MessageCircle size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Podcast Description
                    </span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Episode Title */}
            {data.episode_title && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Episode Title
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{data.episode_title}</span>
                </div>
            )}

            {/* Description */}
            {data.description && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 14, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Description</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{data.description}</span>
                </div>
            )}

            {/* Show Notes */}
            {data.show_notes && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Show Notes</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.show_notes}</span>
                </div>
            )}

            {/* Key Topics */}
            {hasKeyTopics && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Key Topics</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {data.key_topics.map((topic: string, i: number) => (
                            <span key={i} style={{
                                fontSize: 12, padding: '5px 12px', borderRadius: 999,
                                background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)',
                                color: 'var(--text-primary)', fontWeight: 600
                            }}>
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* SEO Tags */}
            {hasSeoTags && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Hash size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>SEO Tags</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {data.seo_tags.map((tag: string, i: number) => (
                            <span key={i} style={{
                                fontSize: 11, padding: '4px 10px', borderRadius: 999,
                                background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.18)',
                                color: 'var(--accent-1)', fontWeight: 600
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Fallback: Sections */}
            {!hasAgentFields && hasSections && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {data.sections.map((s: any, i: number) => (
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

            {/* Fallback: Recommendations */}
            {!hasAgentFields && hasRecommendations && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {data.recommendations.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>&#8226; {r}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
