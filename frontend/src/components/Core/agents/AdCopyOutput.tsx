import React from 'react';
import { Megaphone, FileText, MousePointerClick, Layout } from 'lucide-react';

interface AdVariation {
    headline?: string;
    body?: string;
    cta?: string;
}

interface AdCopyOutputProps {
    data: {
        variations?: AdVariation[];
    };
    compact?: boolean;
}

export const AdCopyOutput: React.FC<AdCopyOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const variations = data.variations || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {variations.map((v, i) => (
                <div key={i} style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    overflow: 'hidden'
                }}>
                    {/* Header bar */}
                    <div style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, rgba(124,92,255,0.08), rgba(124,92,255,0.02))',
                        borderBottom: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <Megaphone size={14} color="var(--primary)" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Variation {i + 1}
                        </span>
                    </div>

                    <div style={{ padding: compact ? 12 : 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {v.headline && (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Layout size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>HEADLINE</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                        {v.headline}
                                    </div>
                                </div>
                            </div>
                        )}

                        {v.body && (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <FileText size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>PRIMARY TEXT</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                        {v.body}
                                    </div>
                                </div>
                            </div>
                        )}

                        {v.cta && (
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                                <MousePointerClick size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                <div style={{
                                    display: 'inline-block',
                                    padding: '6px 16px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    {v.cta}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
