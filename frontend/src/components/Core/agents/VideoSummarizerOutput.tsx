import React from 'react';
import { FileVideo, Clock, Sparkles, Layout, ListChecks, List, BookOpen } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Props {
    data: any;
    compact?: boolean;
}

const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const VideoSummarizerOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const chapters = data.chapters || [];
    const snippets = data.snippets || [];
    const keyTakeaways = data.key_takeaways || [];
    const sections = data.sections || [];
    const recommendations = data.recommendations || [];
    const actionItems = data.action_items || [];
    const hasSpecificFields = data.summary || chapters.length > 0 || snippets.length > 0 || keyTakeaways.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileVideo size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Video Summary</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                </div>
            </div>

            {/* Summary Card */}
            {data.summary && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 14, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Summary</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.summary}</span>
                </div>
            )}

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Key Takeaways</span>
                    </div>
                    {keyTakeaways.map((t: string, i: number) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {typeof t === 'string' ? t : formatStructuredValue(t)}</span>
                    ))}
                </div>
            )}

            {/* Chapters Timeline */}
            {chapters.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 12,
                    padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <List size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Chapters</span>
                    </div>
                    {chapters.map((ch: any, i: number) => (
                        <div key={i} style={{
                            display: 'flex', gap: 10,
                            padding: '8px 0',
                            borderBottom: i < chapters.length - 1 ? '1px solid var(--border-default)' : 'none'
                        }}>
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--accent-1)',
                                fontFamily: 'monospace', minWidth: 52,
                                padding: '3px 8px', borderRadius: 6,
                                background: 'rgba(20,184,166,0.10)',
                                textAlign: 'center', flexShrink: 0, height: 'fit-content'
                            }}>{ch.timestamp || '0:00'}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ch.title}</span>
                                {ch.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ch.content}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Snippets */}
            {snippets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="var(--accent-1)" /> Notable Snippets
                    </span>
                    {snippets.map((sn: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: 'var(--accent-1)',
                                    fontFamily: 'monospace', padding: '2px 8px', borderRadius: 6,
                                    background: 'rgba(20,184,166,0.10)'
                                }}>
                                    {sn.start_time != null && sn.end_time != null
                                        ? `${formatTime(sn.start_time)} - ${formatTime(sn.end_time)}`
                                        : sn.start_time != null ? formatTime(sn.start_time) : ''}
                                </span>
                            </div>
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sn.text}</span>
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

