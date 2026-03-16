import React from 'react';
import { Quote, Sparkles, Heart } from 'lucide-react';

interface TaglineOption {
    tagline: string;
    tone?: string;
    memorability_score?: number;
    reasoning?: string;
}

interface TaglineOutputProps {
    data: {
        options?: TaglineOption[];
        context_updates?: any;
    };
    compact?: boolean;
}

const scoreBadge = (score?: number) => {
    if (score === undefined || score === null || isNaN(Number(score))) return null;
    const val = Number(score) <= 1 ? Number(score) * 100 : Number(score);
    const display = Number.isInteger(val) ? val : Number(val.toFixed(1));
    const color = val >= 80 ? '#22c55e' : val >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <span style={{
            padding: '4px 8px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 800,
            color,
            border: `1px solid ${color}40`,
            background: `${color}12`
        }}>
            {display}/100
        </span>
    );
};

export const TaglineOutput: React.FC<TaglineOutputProps> = ({ data, compact = false }) => {
    const options = data?.options || [];
    if (!options.length) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {data.context_updates?.tagline && (
                <div style={{
                    marginBottom: 6,
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    border: '1px solid rgba(34,197,94,0.25)',
                    background: 'rgba(34,197,94,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <Sparkles size={16} color="#22c55e" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Saved to Brand Context</span>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{data.context_updates.tagline}</span>
                    </div>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: compact ? 10 : 14
            }}>
                {options.map((opt, i) => (
                    <div key={i} style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: 14,
                        padding: compact ? 12 : 16,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Quote size={18} color="var(--accent-1)" />
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                                {opt.tagline}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {opt.tone && (
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: 999,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    fontSize: 12,
                                    color: 'var(--text-secondary)'
                                }}>
                                    {opt.tone}
                                </span>
                            )}
                            {scoreBadge(opt.memorability_score)}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Option {i + 1}</span>
                        </div>
                        {opt.reasoning && (
                            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {opt.reasoning}
                            </p>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};
