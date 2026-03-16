import React from 'react';
import { FileText, Layout, Tags, Image, Sparkles, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const BlogPostOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const sections = data.sections || [];
    const metaDescription = data.meta_description || '';
    const suggestedImages = data.suggested_images || [];
    const keywords = data.keywords || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(34,197,94,0.10))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <FileText size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                    {metaDescription && (
                        <span style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-primary)',
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 4
                        }}>
                            <Tags size={12} />
                            {metaDescription}
                        </span>
                    )}
                </div>
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {keywords.map((kw: string, i: number) => (
                        <span key={i} style={{
                            padding: '5px 12px',
                            borderRadius: 999,
                            background: 'rgba(124,92,255,0.1)',
                            border: '1px solid rgba(124,92,255,0.25)',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#7c5cff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <Tags size={10} />{typeof kw === 'string' ? kw : formatStructuredValue(kw)}
                        </span>
                    ))}
                </div>
            )}

            {/* Sections */}
            {sections.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {sections.map((s: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layout size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {s.heading || `Section ${i + 1}`}
                                </span>
                            </div>
                            {s.content && (
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                    {s.content}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Suggested Images */}
            {suggestedImages.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Image size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Suggested Images</span>
                    </div>
                    {suggestedImages.map((img: any, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {'\u2022'} {typeof img === 'string' ? img : img.description || formatStructuredValue(img)}
                        </span>
                    ))}
                </div>
            )}

            {/* Recommendations & Action Items fallback */}
            {(recommendations.length > 0 || actionItems.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={14} color="var(--primary)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Highlights</span>
                            </div>
                            {recommendations.map((b: string, i: number) => (
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {'\u2022'} {b}
                                </span>
                            ))}
                        </div>
                    )}
                    {actionItems.length > 0 && (
                        <div style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ListChecks size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                            </div>
                            {actionItems.map((a: string, i: number) => (
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {'\u2022'} {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

