import React from 'react';
import { Package, Layout, CheckCircle2, Sparkles, ListChecks, List } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const ProductDescriptionOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const description = data.description || '';
    const features = data.features || [];
    const specs = data.specs || data.specifications || null;
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];

    const renderSpecs = () => {
        if (!specs) return null;
        let entries: [string, string][] = [];
        if (Array.isArray(specs)) {
            entries = specs.map((s: any, i: number) => {
                if (typeof s === 'string') return [`Spec ${i + 1}`, s];
                return [s.label || s.name || `Spec ${i + 1}`, s.value || formatStructuredValue(s)];
            });
        } else if (typeof specs === 'object') {
            entries = Object.entries(specs).map(([k, v]) => [k, String(v)]);
        } else {
            return null;
        }
        if (entries.length === 0) return null;

        return (
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
                    <List size={14} color="var(--accent-1)" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Specifications</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {entries.map(([label, value], i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', gap: 12,
                            padding: '6px 8px',
                            borderRadius: 6,
                            background: i % 2 === 0 ? 'var(--bg-primary)' : 'transparent'
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
                    <Package size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                </div>
            </div>

            {/* Description */}
            {description && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Package size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Description</span>
                    </div>
                    <span style={{
                        fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65,
                        whiteSpace: 'pre-wrap'
                    }}>
                        {description}
                    </span>
                </div>
            )}

            {/* Features */}
            {features.length > 0 && (
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
                        <CheckCircle2 size={14} color="#22c55e" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Features</span>
                    </div>
                    {features.map((f: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <CheckCircle2 size={12} color="#22c55e" style={{ flexShrink: 0, marginTop: 3 }} />
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {typeof f === 'string' ? f : f.name || f.feature || formatStructuredValue(f)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Specs Table */}
            {renderSpecs()}

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

