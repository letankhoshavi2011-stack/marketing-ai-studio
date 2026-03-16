import React from 'react';
import { Search, Layout, AlertTriangle, Lightbulb, CheckCircle2, Sparkles, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const ContentAuditOutput: React.FC<Props> = ({ data, compact }) => {
    if (!data) return null;

    const title = data.title || '';
    const auditFindings = data.audit_findings || data.findings || [];
    const gaps = data.gaps || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const sections = data.sections || [];

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
                    <Search size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    {title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                        {auditFindings.length > 0 && (
                            <span style={{
                                padding: '4px 10px', borderRadius: 999,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                fontSize: 11, fontWeight: 700, color: '#ef4444'
                            }}>
                                {auditFindings.length} finding{auditFindings.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {gaps.length > 0 && (
                            <span style={{
                                padding: '4px 10px', borderRadius: 999,
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                                fontSize: 11, fontWeight: 700, color: '#f59e0b'
                            }}>
                                {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Audit Findings */}
            {auditFindings.length > 0 && (
                <div style={{
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'rgba(239,68,68,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={14} color="#ef4444" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Audit Findings</span>
                    </div>
                    {auditFindings.map((f: any, i: number) => (
                        <div key={i} style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                marginTop: 2, background: 'rgba(239,68,68,0.15)',
                                color: '#ef4444', padding: '2px 6px', borderRadius: 6,
                                fontSize: 10, fontWeight: 800, flexShrink: 0
                            }}>{i + 1}</div>
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {typeof f === 'string' ? f : f.finding || f.description || f.summary || formatStructuredValue(f)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Gaps */}
            {gaps.length > 0 && (
                <div style={{
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'rgba(245,158,11,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Search size={14} color="#f59e0b" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Content Gaps</span>
                    </div>
                    {gaps.map((g: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{
                                marginTop: 6, width: 4, height: 4, borderRadius: '50%',
                                background: '#f59e0b', flexShrink: 0
                            }} />
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {typeof g === 'string' ? g : g.gap || g.description || formatStructuredValue(g)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations Grid */}
            {recommendations.length > 0 && (
                <div style={{
                    border: '1px solid rgba(124,92,255,0.2)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'rgba(124,92,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lightbulb size={14} color="#7c5cff" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 8
                    }}>
                        {recommendations.map((r: any, i: number) => (
                            <div key={i} style={{
                                padding: '8px 10px',
                                borderRadius: 8,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)',
                                display: 'flex',
                                gap: 8,
                                alignItems: 'flex-start'
                            }}>
                                <CheckCircle2 size={12} color="#7c5cff" style={{ flexShrink: 0, marginTop: 3 }} />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {typeof r === 'string' ? r : r.recommendation || r.summary || formatStructuredValue(r)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Items */}
            {actionItems.length > 0 && (
                <div style={{
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 12,
                    padding: compact ? 10 : 14,
                    background: 'rgba(34,197,94,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={14} color="#22c55e" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                    </div>
                    {actionItems.map((a: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{
                                marginTop: 2, background: 'rgba(34,197,94,0.15)',
                                color: '#22c55e', padding: '2px 6px', borderRadius: 6,
                                fontSize: 10, fontWeight: 800, flexShrink: 0
                            }}>{i + 1}</div>
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {typeof a === 'string' ? a : a.action || a.description || formatStructuredValue(a)}
                            </span>
                        </div>
                    ))}
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
        </div>
    );
};

