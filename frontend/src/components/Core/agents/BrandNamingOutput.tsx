import React from 'react';
import { Sparkles, Globe2, BadgeCheck, Crown, Target } from 'lucide-react';

interface BrandNameOption {
    name: string;
    rationale?: string;
    domain_suggestions?: string[];
    style?: string;
    score?: number;
}

interface BrandNamingOutputProps {
    data: {
        top_pick?: string;
        options?: BrandNameOption[];
        brand_values?: string[];
        tone?: string[];
    };
    compact?: boolean;
}

const pill = (text: string, subtle = false) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: subtle ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-default)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        background: subtle ? 'rgba(255,255,255,0.04)' : 'var(--bg-primary)'
    }}>{text}</span>
);

export const BrandNamingOutput: React.FC<BrandNamingOutputProps> = ({ data, compact = false }) => {
    const options: BrandNameOption[] = data?.options || [];
    const top = data?.top_pick || options[0]?.name;
    const formatScore = (s?: number) => {
        if (s === undefined || s === null || isNaN(Number(s))) return undefined;
        const num = s <= 1 ? s * 100 : s;
        return Number.isInteger(num) ? num : Number(num.toFixed(1));
    };

    if (!options.length && !top) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 18 }}>
            {/* Top pick */}
            {top && (
                <div style={{
                    padding: compact ? 14 : 18,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.12) 0%, rgba(124,92,255,0.04) 100%)',
                    border: '1px solid rgba(124,92,255,0.25)',
                    display: 'flex',
                    alignItems: compact ? 'flex-start' : 'center',
                    gap: 12,
                    position: 'relative'
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(124,92,255,0.16)', border: '1px solid rgba(124,92,255,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Crown size={20} color="var(--accent-1)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: compact ? 18 : 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                                {top}
                            </h3>
                            <BadgeCheck size={18} color="var(--accent-1)" />
                            {data.tone?.length ? pill(data.tone.join(' / '), true) : null}
                        </div>
                        {data.brand_values?.length && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {data.brand_values.map((v: string, i: number) => pill(v, true))}
                            </div>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top pick for your brief</span>
                    </div>
                </div>
            )}

            {/* Options grid */}
            {options.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {options.slice(0, compact ? 4 : options.length).map((opt, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 14,
                            padding: 14,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Sparkles size={16} color="var(--primary)" />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{opt.name}</span>
                                </div>
                                {formatScore(opt.score) !== undefined && (
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 8,
                                        background: 'rgba(34,197,94,0.12)',
                                        color: '#22c55e',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        border: '1px solid rgba(34,197,94,0.25)'
                                    }}>
                                        {formatScore(opt.score)}/100
                                    </span>
                                )}
                            </div>
                            {opt.style && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Style: {opt.style}</span>}
                            {opt.rationale && (
                                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {opt.rationale}
                                </p>
                            )}
                            {opt.domain_suggestions && opt.domain_suggestions.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {opt.domain_suggestions.map((d, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 8px',
                                            borderRadius: 10,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'var(--text-secondary)',
                                            fontSize: 12,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>
                                            <Globe2 size={12} /> {d}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
