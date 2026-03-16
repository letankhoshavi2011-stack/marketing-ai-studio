import React from 'react';
import { Code, FileText, CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
        schema_json?: any;
    };
}

export const SchemaMarkupOutput: React.FC<Props> = ({ data }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;
    const schemaJson = data.schema_json || (data as any).schema || null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(124,92,255,0.25)', background: 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(34,197,94,0.10))', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,92,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code size={20} color="#7c5cff" />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7c5cff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schema Markup</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{title || 'Structured Data'}</div>
                </div>
            </div>

            {schemaJson && (
                <pre style={{ margin: 0, padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6, overflowX: 'auto' }}>
{JSON.stringify(schemaJson, null, 2)}
                </pre>
            )}

            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={13} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{s.content}</div>}
                        </div>
                    ))}
                </div>
            )}

            {(recommendations.length > 0 || action_items.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Sparkles size={14} color="#3b82f6" /> Recommendations
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <CheckCircle2 size={14} color="#10b981" /> Action Items
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
