import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, AlertOctagon, ListChecks, ThumbsUp, Sparkles } from 'lucide-react';

interface ComplianceIssue {
    severity: string;
    category: string;
    description: string;
    suggestion: string;
}

interface BrandGuardianOutputProps {
    data: {
        passed?: boolean;
        compliance_score?: number;
        summary?: string;
        issues?: ComplianceIssue[];
        context_updates?: any;
    };
    compact?: boolean;
}

const severityColor = (sev: string) => {
    const s = (sev || '').toLowerCase();
    if (s.includes('high') || s === 'critical' || s === 'severe') return '#ef4444';
    if (s.includes('medium') || s === 'moderate') return '#f59e0b';
    return '#22c55e';
};

const normalizeScore = (score?: number) => {
    if (score === undefined || score === null || isNaN(Number(score))) return undefined;
    const val = Number(score);
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
};

export const BrandGuardianOutput: React.FC<BrandGuardianOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    const score = normalizeScore(data.compliance_score);
    const passed = data.passed ?? (score !== undefined ? score >= 80 : undefined);
    const issues = data.issues || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {data.context_updates && (
                <div style={{
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
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            Compliance guardrails synced for future generations.
                        </span>
                    </div>
                </div>
            )}

            <div style={{
                padding: compact ? 14 : 18,
                borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.10), rgba(124,92,255,0.10))',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shield size={22} color="var(--accent-1)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Brand Guardian</span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            Compliance review and rewrites to keep outputs on-brand.
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {score !== undefined && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: compact ? 10 : 12,
                            borderRadius: 12,
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-primary)'
                        }}>
                            <div style={{
                                width: compact ? 44 : 52,
                                height: compact ? 44 : 52,
                                borderRadius: 12,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: compact ? 16 : 20, fontWeight: 800, color: 'var(--text-primary)' }}>{score}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Compliance score</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Higher is safer</span>
                            </div>
                        </div>
                    )}
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 999,
                        border: `1px solid ${passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                        color: passed ? '#22c55e' : '#ef4444',
                        background: passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        fontWeight: 800,
                        fontSize: 12,
                        letterSpacing: '0.05em'
                    }}>
                        {passed ? <CheckCircle2 size={14} /> : <AlertOctagon size={14} />}
                        {passed ? 'PASS' : 'FAIL'}
                    </span>
                </div>
            </div>

            {data.summary && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 14,
                    padding: compact ? 12 : 14,
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <ThumbsUp size={16} color="var(--accent-1)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {data.summary}
                    </span>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: compact ? 10 : 12
            }}>
                {issues.length > 0 ? issues.map((iss, idx) => {
                    const color = severityColor(iss.severity);
                    return (
                        <div key={idx} style={{
                            border: `1px solid ${color}33`,
                            borderRadius: 14,
                            padding: compact ? 12 : 14,
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
                                <AlertTriangle size={16} />
                                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em' }}>{(iss.severity || 'Issue').toUpperCase()}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{iss.category}</span>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{iss.description}</span>
                            {iss.suggestion && (
                                <div style={{
                                    marginTop: 4,
                                    padding: 10,
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'flex-start'
                                }}>
                                    <ListChecks size={14} color="var(--accent-1)" style={{ marginTop: 2 }} />
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{iss.suggestion}</span>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: 14,
                        padding: compact ? 12 : 14,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <CheckCircle2 size={16} color="#22c55e" />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No compliance issues detected.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
