import React from 'react';
import { Video, Sparkles, Layout, ListChecks } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

export const AiVideoGenOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const assets = data.assets || [];
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = assets.length > 0 || data.prompt_used;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI Video Generation</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Prompt Used (top-level) */}
            {data.prompt_used && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Generation Prompt</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, fontStyle: 'italic' }}>{data.prompt_used}</span>
                </div>
            )}

            {/* Assets Media Grid */}
            {assets.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 200 : 280}px, 1fr))`, gap: 12 }}>
                    {assets.map((asset: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            overflow: 'hidden', background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            {asset.gcs_url && (asset.asset_type === 'video' ? (
                                <video src={asset.gcs_url} controls style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover', background: '#000' }} />
                            ) : (
                                <img src={asset.gcs_url} alt={`Generated asset ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                            ))}
                            {asset.prompt_used && (
                                <div style={{ padding: compact ? 8 : 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prompt</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{asset.prompt_used}</span>
                                </div>
                            )}
                            {asset.asset_type && (
                                <div style={{ padding: '0 10px 8px' }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color: 'var(--accent-1)',
                                        padding: '3px 8px', borderRadius: 6,
                                        background: 'rgba(168,85,247,0.10)',
                                        textTransform: 'uppercase'
                                    }}>{asset.asset_type}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback: sections */}
            {!hasSpecificFields && sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: compact ? 10 : 12 }}>
                    {sections.map((s: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layout size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback: recommendations */}
            {!hasSpecificFields && recommendations.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommendations</span>
                    </div>
                    {recommendations.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof r === 'string' ? r : formatStructuredValue(r)}</span>
                    ))}
                </div>
            )}

            {/* Fallback: action_items */}
            {!hasSpecificFields && actionItems.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Action Items</span>
                    </div>
                    {actionItems.map((a: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof a === 'string' ? a : formatStructuredValue(a)}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

