import React from 'react';
import { Activity, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface SEOAuditOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
        text_content?: string;
        raw_response?: string;
        [key: string]: any;
    };
    compact?: boolean;
}

export const SEOAuditOutput: React.FC<SEOAuditOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [] } = data;

    const tryParseJsonString = (value: string): any => {
        const trimmed = value.trim();
        const looksLikeJson =
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'));
        if (!looksLikeJson) return value;
        try {
            return JSON.parse(trimmed);
        } catch {
            return value;
        }
    };

    const normalizeValue = (value: any): any => {
        if (typeof value === 'string') return tryParseJsonString(value);
        return value;
    };

    const toDisplayString = (value: any): string => {
        if (typeof value === 'string') return value;
        if (value === null || value === undefined) return '';
        return formatStructuredValue(value);
    };

    const renderIssueCard = (issue: any, index: number) => (
        <div
            key={index}
            style={{
                padding: 12,
                borderRadius: 10,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {issue.issue || `Issue ${index + 1}`}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {issue.priority && (
                    <span style={{ fontSize: 11, color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 999, padding: '2px 8px' }}>
                        Priority: {issue.priority}
                    </span>
                )}
                {issue.impact && (
                    <span style={{ fontSize: 11, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 999, padding: '2px 8px' }}>
                        Impact: {issue.impact}
                    </span>
                )}
                {issue.effort && (
                    <span style={{ fontSize: 11, color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 999, padding: '2px 8px' }}>
                        Effort: {issue.effort}
                    </span>
                )}
            </div>
            {issue.observation && (
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <b>Observation:</b> {toDisplayString(issue.observation)}
                </div>
            )}
            {issue.fix_instruction && (
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <b>Fix:</b> {toDisplayString(issue.fix_instruction)}
                </div>
            )}
        </div>
    );

    const renderObject = (obj: Record<string, any>) => {
        const entries = Object.entries(obj);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map(([k, v]) => {
                    const vNorm = normalizeValue(v);
                    if (Array.isArray(vNorm)) {
                        return (
                            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {vNorm.map((item: any, i: number) => <li key={i}>{toDisplayString(item)}</li>)}
                                </ul>
                            </div>
                        );
                    }
                    return (
                        <div key={k} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <b>{k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:</b> {toDisplayString(vNorm)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSectionContent = (content: any) => {
        const normalized = normalizeValue(content);

        if (Array.isArray(normalized)) {
            const looksLikeIssueList = normalized.every(
                (item) => item && typeof item === 'object' && (item.issue || item.fix_instruction || item.priority),
            );
            if (looksLikeIssueList) {
                return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{normalized.map(renderIssueCard)}</div>;
            }
            return (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {normalized.map((item, i) => <li key={i}>{toDisplayString(item)}</li>)}
                </ul>
            );
        }

        if (normalized && typeof normalized === 'object') {
            return renderObject(normalized);
        }

        return <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{toDisplayString(normalized)}</div>;
    };

    const normalizedSections = Array.isArray(sections) ? sections : [];
    const extraSections = normalizedSections.length > 0
        ? []
        : Object.entries(data)
            .filter(([k, v]) =>
                !['title', 'sections', 'recommendations', 'action_items', 'text_content', 'raw_response'].includes(k)
                && v !== null && v !== undefined && v !== '' && (!(Array.isArray(v)) || v.length > 0)
            )
            .map(([k, v]) => ({
                heading: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                content: v,
            }));
    const fallbackRaw = data.text_content || data.raw_response || '';
    const hasStructured = normalizedSections.length > 0 || recommendations.length > 0 || action_items.length > 0 || extraSections.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            <div style={{ padding: compact ? 12 : 16, borderRadius: 14, background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(202,138,4,0.05))', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={20} color="#eab308" />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEO Health Audit</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{title || 'Diagnostic Report'}</div>
                </div>
            </div>

            {normalizedSections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {normalizedSections.map((s, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Search size={14} color="#eab308" /> {s.heading}
                            </div>
                            {renderSectionContent(s.content)}
                        </div>
                    ))}
                </div>
            )}

            {extraSections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {extraSections.map((s, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Search size={14} color="#eab308" /> {s.heading}
                            </div>
                            {renderSectionContent(s.content)}
                        </div>
                    ))}
                </div>
            )}

            {(recommendations.length > 0 || action_items.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <AlertTriangle size={14} color="#ef4444" /> Critical Issues
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recommendations.map((r, i) => <li key={i}>{toDisplayString(normalizeValue(r))}</li>)}
                            </ul>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid rgba(16,185,129,0.3)' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <CheckCircle2 size={14} color="#10b981" /> Fix Plan
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {action_items.map((r, i) => <li key={i}>{toDisplayString(normalizeValue(r))}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {!hasStructured && fallbackRaw && (
                <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Raw SEO Audit Response</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{fallbackRaw}</div>
                </div>
            )}
        </div>
    );
};
