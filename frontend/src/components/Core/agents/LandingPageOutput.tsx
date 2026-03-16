import React from 'react';
import { Layout, MousePointerClick, Star, Sparkles, ListChecks, Layers, Zap } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

const sectionIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('hero')) return <Zap size={14} color="#7c5cff" />;
    if (lower.includes('feature')) return <Star size={14} color="#22c55e" />;
    if (lower.includes('testimonial')) return <Sparkles size={14} color="#f59e0b" />;
    if (lower.includes('cta')) return <MousePointerClick size={14} color="#ef4444" />;
    return <Layers size={14} color="var(--accent-1)" />;
};

const sectionBorder = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('hero')) return '1px solid rgba(124,92,255,0.3)';
    if (lower.includes('feature')) return '1px solid rgba(34,197,94,0.3)';
    if (lower.includes('testimonial')) return '1px solid rgba(245,158,11,0.3)';
    if (lower.includes('cta')) return '1px solid rgba(239,68,68,0.3)';
    return '1px solid var(--border-default)';
};

export const LandingPageOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const sections = data.sections || [];
    const meta = data.meta || '';
    const ctaBlocks = data.cta_blocks || [];
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
                    <Layout size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                    {meta && (
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {typeof meta === 'string' ? meta : formatStructuredValue(meta)}
                        </span>
                    )}
                </div>
            </div>

            {/* Page Sections */}
            {sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12 }}>
                    {sections.map((s: any, i: number) => {
                        const heading = s.heading || s.type || `Section ${i + 1}`;
                        return (
                            <div key={i} style={{
                                border: sectionBorder(heading),
                                borderRadius: 12,
                                padding: compact ? 10 : 14,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {sectionIcon(heading)}
                                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {heading}
                                    </span>
                                </div>
                                {s.content && (
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                                        {s.content}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CTA Blocks */}
            {ctaBlocks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ctaBlocks.map((block: any, i: number) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px',
                            background: 'rgba(124,92,255,0.08)',
                            borderRadius: 10,
                            border: '1px solid rgba(124,92,255,0.2)'
                        }}>
                            <MousePointerClick size={16} color="var(--accent-1)" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>CTA {i + 1}:</span>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>
                                {typeof block === 'string' ? block : block.text || block.label || formatStructuredValue(block)}
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

