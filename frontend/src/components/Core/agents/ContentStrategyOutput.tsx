import React from 'react';
import { FileText, LayoutTemplate, Layers, CheckCircle2 } from 'lucide-react';

interface ContentStrategyOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

export const ContentStrategyOutput: React.FC<ContentStrategyOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            <div style={{ padding: compact ? 12 : 16, borderRadius: 14, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(96,165,250,0.05))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content Strategy</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{title || 'Pillars & Distribution'}</div>
                </div>
            </div>

            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <LayoutTemplate size={14} color="#3b82f6" /> {s.heading}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{s.content}</div>
                        </div>
                    ))}
                </div>
            )}

            {(recommendations.length > 0 || action_items.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Layers size={14} color="#8b5cf6" /> Pillar Strategy
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <CheckCircle2 size={14} color="#3b82f6" /> Action Items
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {action_items.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
