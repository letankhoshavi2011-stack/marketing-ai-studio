import React from 'react';
import { FlaskConical, SplitSquareHorizontal, CheckCircle2, Sparkles } from 'lucide-react';

interface ABTestSetupOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

export const ABTestSetupOutput: React.FC<ABTestSetupOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            <div style={{ padding: compact ? 12 : 16, borderRadius: 14, background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(8,145,178,0.05))', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlaskConical size={20} color="#06b6d4" />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>A/B Test Experiment</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{title || 'Testing Protocol'}</div>
                </div>
            </div>

            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <SplitSquareHorizontal size={14} color="#06b6d4" /> {s.heading}
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
                                <Sparkles size={14} color="#06b6d4" /> Recommendations
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.55 }}>
                                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <CheckCircle2 size={14} color="#3b82f6" /> Setup Checklist
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {action_items.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
