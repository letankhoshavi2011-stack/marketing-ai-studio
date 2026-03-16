
import React from 'react';
import {
    Search, ShieldCheck, Sparkles, TrendingUp, CheckCircle2, BarChart, FileText, Link2
} from 'lucide-react';

interface SEOOutputProps {
    data: {
        score?: number;
        recommendations?: any[];
        technical_fixes?: any[];
        suggested_keywords?: any[];
        keyword_opportunities?: any[];
        title_tag?: string;
        meta_description?: string;
        heading_structure?: any[];
        internal_links?: any[];
        schema_markup_suggestions?: any[];
        faq_list?: any[];
        entity_targets?: any[];
        aeo_strategy?: string;
        text_content?: string;
    };
    compact?: boolean;
}

const asArray = (value: any): any[] => {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    return [value];
};

const formatItem = (item: any): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
        if (item.issue && item.fix_recommendation) {
            return `${item.issue}${item.impact ? ` (${item.impact})` : ''}: ${item.fix_recommendation}`;
        }
        if (item.level && item.text) return `${item.level}: ${item.text}`;
        if (item.question && item.answer) return `Q: ${item.question} | A: ${item.answer}`;
        if (item.keyword) return item.keyword;
        if (item.summary) return item.summary;
    }
    return String(item);
};

export const SEOOutput: React.FC<SEOOutputProps> = ({ data, compact = false }) => {
    const hasScore = typeof data.score === 'number';
    const score = hasScore ? (data.score as number) : 0;
    const recommendations = asArray(data.recommendations);
    const technicalFixes = asArray(data.technical_fixes);
    const suggestedKeywords = asArray(data.keyword_opportunities || data.suggested_keywords);
    const headingStructure = asArray(data.heading_structure);
    const internalLinks = asArray(data.internal_links);
    const schemaSuggestions = asArray(data.schema_markup_suggestions);
    const faqList = asArray(data.faq_list);
    const entityTargets = asArray(data.entity_targets);
    const hasOnPageFields = !!data.title_tag || !!data.meta_description || headingStructure.length > 0 || internalLinks.length > 0;

    const getScoreColor = (s: number) => {
        if (s >= 80) return '#22c55e';
        if (s >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const renderKeyword = (kw: any, i: number) => {
        if (typeof kw === 'string') {
            return (
                <div key={i} style={{
                    padding: compact ? '8px 12px' : '10px 16px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <Search size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{kw}</span>
                </div>
            );
        }
        const { keyword, intent, difficulty, volume } = kw || {};
        return (
            <div key={i} style={{
                padding: compact ? '8px 12px' : '10px 16px', background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <Search size={12} color="var(--text-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{keyword || kw?.label || 'Keyword'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {intent ? `${intent}` : ''}{intent && (difficulty || volume) ? ' • ' : ''}{difficulty ? `KD ${difficulty}` : ''}{volume ? ` • ${volume} searches` : ''}
                    </span>
                </div>
            </div>
        );
    };

    const renderList = (items: any[], color: string, fallback: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.length > 0 ? items.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ marginTop: 4 }}><CheckCircle2 size={14} color={color} /></div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{formatItem(rec)}</span>
                </div>
            )) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{fallback}</p>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 20 : 32 }}>
            {hasScore && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.08) 0%, rgba(124,92,255,0.02) 100%)',
                    border: '1px solid rgba(124,92,255,0.15)',
                    borderRadius: 24, padding: compact ? 16 : 32,
                    display: 'flex', alignItems: 'center', gap: compact ? 16 : 40,
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: -20, right: -20, opacity: 0.1,
                        transform: 'rotate(-15deg)'
                    }}>
                        <BarChart size={compact ? 90 : 120} color="#7c5cff" />
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={compact ? "80" : "100"} height={compact ? "80" : "100"} viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={getScoreColor(score)} strokeWidth="8"
                                strokeDasharray={`${(score / 100) * 282.7} 282.7`}
                                strokeLinecap="round" transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 1s ease-out' }}
                            />
                            <text x="50" y="55" fontSize={compact ? "18" : "24"} fontWeight="800" textAnchor="middle" fill="var(--text-primary)">{score}</text>
                        </svg>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: compact ? 18 : 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>SEO Strategy Score</h2>
                    </div>
                </div>
            )}

            {hasOnPageFields && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {(data.title_tag || data.meta_description) && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}>
                                <FileText size={20} />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Meta Elements</h3>
                            </div>
                            {data.title_tag && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}><b>Title:</b> {data.title_tag}</p>}
                            {data.meta_description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}><b>Description:</b> {data.meta_description}</p>}
                        </div>
                    )}

                    {headingStructure.length > 0 && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#22c55e' }}>
                                <TrendingUp size={20} />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Heading Structure</h3>
                            </div>
                            {renderList(headingStructure, '#22c55e', 'No heading suggestions.')}
                        </div>
                    )}

                    {internalLinks.length > 0 && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b' }}>
                                <Link2 size={20} />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Internal Links</h3>
                            </div>
                            {renderList(internalLinks, '#f59e0b', 'No link opportunities provided.')}
                        </div>
                    )}
                </div>
            )}

            {(recommendations.length > 0 || technicalFixes.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                        borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#22c55e' }}>
                            <TrendingUp size={20} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Strategic Recommendations</h3>
                        </div>
                        {renderList(compact ? recommendations.slice(0, 3) : recommendations, '#22c55e', 'No recommendations generated.')}
                    </div>

                    <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                        borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b' }}>
                            <ShieldCheck size={20} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Technical Fixes</h3>
                        </div>
                        {renderList(compact ? technicalFixes.slice(0, 3) : technicalFixes, '#f59e0b', 'No critical issues found.')}
                    </div>
                </div>
            )}

            {suggestedKeywords.length > 0 && (
                <div style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                    borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}>
                            <Sparkles size={20} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Keyword Opportunities</h3>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{suggestedKeywords.length} Keywords found</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {suggestedKeywords.slice(0, compact ? 8 : suggestedKeywords.length).map(renderKeyword)}
                    </div>
                </div>
            )}

            {(schemaSuggestions.length > 0 || faqList.length > 0 || entityTargets.length > 0 || data.aeo_strategy) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {schemaSuggestions.length > 0 && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Schema Suggestions</h3>
                            {renderList(schemaSuggestions, '#22c55e', 'No schema suggestions.')}
                        </div>
                    )}

                    {faqList.length > 0 && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>FAQ For AEO</h3>
                            {renderList(faqList, '#7c5cff', 'No FAQ generated.')}
                        </div>
                    )}

                    {(entityTargets.length > 0 || data.aeo_strategy) && (
                        <div style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 20, padding: compact ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AEO Strategy</h3>
                            {data.aeo_strategy && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{data.aeo_strategy}</p>}
                            {entityTargets.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {entityTargets.map((entity, i) => (
                                        <span key={i} style={{
                                            fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-default)', borderRadius: 999, padding: '4px 10px'
                                        }}>
                                            {formatItem(entity)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!compact && data.text_content && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ height: 1, flex: 1, background: 'var(--border-default)' }} />
                        <div style={{ height: 1, flex: 1, background: 'var(--border-default)' }} />
                    </div>
                </div>
            )}
        </div>
    );
};
