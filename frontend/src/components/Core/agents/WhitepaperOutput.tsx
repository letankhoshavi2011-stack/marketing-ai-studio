import React from 'react';
import { Database, Layout, BookOpen, Sparkles, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const WhitepaperOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const abstract = data.abstract || '';
    const sections = data.sections || [];
    const bibliography = data.bibliography || [];
    const keyPoints = data.key_points || [];
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
                    <Database size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                </div>
            </div>

            {/* Abstract */}
            {abstract && (
                <div style={{
                    border: '1px solid rgba(124,92,255,0.2)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'rgba(124,92,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={14} color="#7c5cff" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Abstract</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                        {abstract}
                    </span>
                </div>
            )}

            {/* Key Points */}
            {keyPoints.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Key Points</span>
                    </div>
                    {keyPoints.map((kp: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {'\u2022'} {typeof kp === 'string' ? kp : formatStructuredValue(kp)}
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
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Bibliography */}
            {bibliography.length > 0 && (
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
                        <BookOpen size={14} color="var(--text-secondary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Bibliography</span>
                    </div>
                    {bibliography.map((ref: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                                background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4,
                                flexShrink: 0
                            }}>[{i + 1}]</span>
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {typeof ref === 'string' ? ref : ref.citation || ref.title || formatStructuredValue(ref)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations & Action Items */}
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
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{'\u2022'} {b}</span>
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
                                <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{'\u2022'} {a}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

