import React from 'react';
import { MessageSquare, Layout, Sparkles, ListChecks, Hash } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const SmsMarketingOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const messageVariants = data.message_variants || data.variants || data.messages || [];
    const characterCounts = data.character_counts || null;
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
                    <MessageSquare size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                    {messageVariants.length > 0 && (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {messageVariants.length} variant{messageVariants.length !== 1 ? 's' : ''} generated
                        </span>
                    )}
                </div>
            </div>

            {/* Message Variants */}
            {messageVariants.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
                    {messageVariants.map((variant: any, i: number) => {
                        const message = typeof variant === 'string' ? variant : (variant.message || variant.text || variant.content || formatStructuredValue(variant));
                        const charCount = typeof variant === 'string'
                            ? variant.length
                            : (variant.character_count || variant.char_count || (variant.message || variant.text || '').length);
                        const label = typeof variant === 'object' && variant.label ? variant.label : `Variant ${i + 1}`;

                        return (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)',
                                borderRadius: 12,
                                padding: compact ? 10 : 14,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MessageSquare size={14} color="var(--accent-1)" />
                                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{label}</span>
                                    </div>
                                    {charCount > 0 && (
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: 999,
                                            background: charCount <= 160 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                            border: `1px solid ${charCount <= 160 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: charCount <= 160 ? '#22c55e' : '#f59e0b',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <Hash size={10} />
                                            {charCount} chars
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55,
                                    whiteSpace: 'pre-wrap',
                                    padding: '8px 10px',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 8,
                                    border: '1px solid var(--border-default)'
                                }}>
                                    {message}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Character Counts Summary */}
            {characterCounts && typeof characterCounts === 'object' && !Array.isArray(characterCounts) && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Hash size={14} color="var(--text-secondary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Character Counts</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(characterCounts).map(([key, val], i) => (
                            <span key={i} style={{
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-default)',
                                fontSize: 12,
                                color: 'var(--text-secondary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                <span style={{ fontWeight: 700 }}>{key}:</span> {String(val)}
                            </span>
                        ))}
                    </div>
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

