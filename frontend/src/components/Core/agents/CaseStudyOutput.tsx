import React from 'react';
import { FileText, AlertCircle, Lightbulb, TrendingUp, Quote, Layout, Sparkles, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const CaseStudyOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const problem = data.problem || '';
    const solution = data.solution || '';
    const results = data.results || '';
    const testimonial = data.testimonial || '';
    const sections = data.sections || [];
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
                </div>
            </div>

            {/* Problem / Solution / Results Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: compact ? 10 : 12
            }}>
                {problem && (
                    <div style={{
                        borderRadius: 12,
                        padding: compact ? 10 : 14,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        borderLeft: '4px solid #ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderLeftWidth: 4
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={14} color="#ef4444" />
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Problem</span>
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                            {typeof problem === 'string' ? problem : formatStructuredValue(problem)}
                        </span>
                    </div>
                )}
                {solution && (
                    <div style={{
                        borderRadius: 12,
                        padding: compact ? 10 : 14,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        borderLeft: '4px solid #3b82f6',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderLeftWidth: 4
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Lightbulb size={14} color="#3b82f6" />
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Solution</span>
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                            {typeof solution === 'string' ? solution : formatStructuredValue(solution)}
                        </span>
                    </div>
                )}
                {results && (
                    <div style={{
                        borderRadius: 12,
                        padding: compact ? 10 : 14,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        borderLeft: '4px solid #22c55e',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderLeftWidth: 4
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={14} color="#22c55e" />
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Results</span>
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                            {typeof results === 'string' ? results : formatStructuredValue(results)}
                        </span>
                    </div>
                )}
            </div>

            {/* Testimonial */}
            {testimonial && (
                <div style={{
                    border: '1px solid rgba(124,92,255,0.2)',
                    borderRadius: 12,
                    padding: compact ? 12 : 16,
                    background: 'rgba(124,92,255,0.05)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start'
                }}>
                    <Quote size={18} color="#7c5cff" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                        fontStyle: 'italic'
                    }}>
                        {typeof testimonial === 'string' ? testimonial : formatStructuredValue(testimonial)}
                    </span>
                </div>
            )}

            {/* Sections fallback */}
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

