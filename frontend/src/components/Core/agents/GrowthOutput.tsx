import React from 'react';
import { Target, ListChecks, Lightbulb, Sparkles } from 'lucide-react';

interface GrowthOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

export const GrowthOutput: React.FC<GrowthOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;
    const hasContent = sections.length > 0 || recommendations.length > 0 || action_items.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {title && (
                <div style={{
                    padding: compact ? 12 : 14, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.10), rgba(124,92,255,0.10))',
                    border: '1px solid rgba(124,92,255,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <Target size={18} color="var(--accent-1)" />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Strategy</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</div>
                    </div>
                </div>
            )}

            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: compact ? 10 : 12 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Lightbulb size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{s.content}</span>}
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
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.5 }}>
                                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ListChecks size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.5 }}>
                                {action_items.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {!hasContent && !title && (
                <div style={{ padding: 14, borderRadius: 12, border: '1px dashed var(--border-default)', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                    No analysis data available yet.
                </div>
            )}
        </div>
    );
};
