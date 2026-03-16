import React from 'react';
import { Megaphone, FileText, MousePointerClick, Layout, DollarSign, Search, Tag, BarChart3, Sparkles, ListChecks } from 'lucide-react';
import MediaSlider from '../../MediaSlider';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const AmazonPPCOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;
    const variations = data?.variations || [];
    const sections = data?.sections || [];
    const recommendations = data?.recommendations || [];
    const actionItems = data?.action_items || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Platform header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(255,153,0,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Amazon PPC Ads</span>
                    {data?.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {variations.map((v: any, i: number) => {
                const searchTerms = v.search_terms || [];

                return (
                    <div key={i} style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: 12,
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden'
                    }}>
                        {/* Variation header */}
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
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>BODY</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                            {v.body}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search terms as tags */}
                            {searchTerms.length > 0 && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Search size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>SEARCH TERMS</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {searchTerms.map((term: string, idx: number) => (
                                                <span key={idx} style={{
                                                    padding: '4px 10px',
                                                    background: 'rgba(255,153,0,0.10)',
                                                    border: '1px solid rgba(255,153,0,0.25)',
                                                    borderRadius: 20,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: 'var(--text-secondary)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}>
                                                    <Tag size={10} />
                                                    {term}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ASIN */}
                            {v.asin && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Tag size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>ASIN</div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            background: 'rgba(255,153,0,0.06)',
                                            border: '1px solid rgba(255,153,0,0.15)',
                                            borderRadius: 6,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            fontFamily: 'monospace',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {v.asin}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bid strategy */}
                            {v.bid_strategy && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <BarChart3 size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>BID STRATEGY</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                            {v.bid_strategy}
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
                );
            })}

            {variations.length === 0 && sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: compact ? 10 : 12 }}>
                    {sections.map((s: any, i: number) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layout size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}
            {variations.length === 0 && (recommendations.length > 0 || actionItems.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={14} color="var(--primary)" /><span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span></div>
                            {recommendations.map((r: string, i: number) => (<span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{'\u2022'} {typeof r === 'string' ? r : formatStructuredValue(r)}</span>))}
                        </div>
                    )}
                    {actionItems.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: compact ? 10 : 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ListChecks size={14} color="var(--accent-1)" /><span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span></div>
                            {actionItems.map((a: string, i: number) => (<span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{'\u2022'} {typeof a === 'string' ? a : formatStructuredValue(a)}</span>))}
                        </div>
                    )}
                </div>
            )}
            {data.assets?.length > 0 && (
                <MediaSlider items={data.assets.map((a: any) => ({
                    type: a.asset_type || a.type || 'image',
                    url: a.gcs_url || a.url || a.local_path
                }))} />
            )}
        </div>
    );
};


