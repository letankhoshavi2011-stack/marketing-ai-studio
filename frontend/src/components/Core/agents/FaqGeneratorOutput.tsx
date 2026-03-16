import React from 'react';
import { HelpCircle, Layout, Sparkles, ListChecks, ChevronRight } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const FaqGeneratorOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const faqPairs = data.faq_pairs || data.faqs || [];
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
                    <HelpCircle size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                    {faqPairs.length > 0 && (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {faqPairs.length} question{faqPairs.length !== 1 ? 's' : ''} generated
                        </span>
                    )}
                </div>
            </div>

            {/* FAQ Pairs */}
            {faqPairs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
                    {faqPairs.map((faq: any, i: number) => {
                        const question = typeof faq === 'string' ? faq : (faq.question || faq.q || `Question ${i + 1}`);
                        const answer = typeof faq === 'string' ? '' : (faq.answer || faq.a || '');
                        return (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)',
                                borderRadius: 12,
                                overflow: 'hidden',
                                background: 'var(--bg-secondary)'
                            }}>
                                {/* Question Header */}
                                <div style={{
                                    padding: compact ? '8px 10px' : '10px 14px',
                                    background: 'rgba(124,92,255,0.06)',
                                    borderBottom: answer ? '1px solid var(--border-default)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    <span style={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: 'rgba(124,92,255,0.15)',
                                        border: '1px solid rgba(124,92,255,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 800, color: '#7c5cff', flexShrink: 0
                                    }}>Q</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                                        {question}
                                    </span>
                                    <ChevronRight size={14} color="var(--text-secondary)" />
                                </div>
                                {/* Answer Body */}
                                {answer && (
                                    <div style={{
                                        padding: compact ? '8px 10px' : '10px 14px',
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'flex-start'
                                    }}>
                                        <span style={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: 'rgba(34,197,94,0.15)',
                                            border: '1px solid rgba(34,197,94,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 800, color: '#22c55e', flexShrink: 0
                                        }}>A</span>
                                        <span style={{
                                            fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55,
                                            whiteSpace: 'pre-wrap', flex: 1
                                        }}>
                                            {answer}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
