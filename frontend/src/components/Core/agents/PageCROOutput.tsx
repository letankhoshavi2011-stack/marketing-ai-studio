import React from 'react';
import { Gauge, Target, ListChecks, Sparkles, FileText } from 'lucide-react';

interface Props {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

export const PageCROOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
            {title && (
                <div style={{ padding: compact ? 12 : 14, borderRadius: 14, border: '1px solid rgba(124,92,255,0.3)', background: 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(34,197,94,0.12))', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Gauge size={16} color="var(--accent-1)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Page CRO Audit</span>
                        <span style={{ fontSize: 16, fontWeight: 850, color: 'var(--text-primary)' }}>{title}</span>
                    </div>
                </div>
            )}

            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: compact ? 10 : 12 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={13} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {(recommendations.length > 0 || action_items.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={14} color="var(--primary)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.55 }}>
                                {recommendations.map((r, i) => <li key={i}><Target size={10} style={{ display: 'inline', marginRight: 6 }} />{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ListChecks size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.55 }}>
                                {action_items.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
