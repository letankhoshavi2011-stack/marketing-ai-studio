import React from 'react';
import { Calendar, Clock, Hash, Target, ListChecks, Sparkles, Share2 } from 'lucide-react';

interface CalendarEntry {
    day: string;
    channel: string;
    content_type: string;
    topic: string;
    caption_idea?: string;
    hashtags?: string[];
    best_time?: string;
}

interface ContentCalendarOutputProps {
    data: {
        title?: string;
        weekly_summary?: string;
        entries?: CalendarEntry[];
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

const pill = (text: string) => (
    <span style={{
        padding: '5px 9px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontSize: 11
    }}>{text}</span>
);

export const ContentCalendarOutput: React.FC<ContentCalendarOutputProps> = ({ data, compact = false }) => {
    const entries = data?.entries || [];
    const sections = data?.sections || [];
    const recs = data?.recommendations || data?.action_items || [];
    const duration = (data as any)?.duration_weeks || (data as any)?.duration;
    const channels = (data as any)?.channels || [];

    if (!entries.length && !sections.length) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {(data.title || data.weekly_summary || duration || (channels?.length)) && (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(34,197,94,0.10))',
                    border: '1px solid rgba(124,92,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap'
                }}>
                    <Calendar size={18} color="var(--accent-1)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: 1 }}>
                        {data.title && <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                        {data.weekly_summary && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{data.weekly_summary}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {duration && pill(`${duration} weeks`)}
                        {channels?.length > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 10px',
                                borderRadius: 999,
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-primary)',
                                fontSize: 12,
                                color: 'var(--text-secondary)'
                            }}>
                                <Share2 size={12} /> {channels.slice(0, compact ? 3 : channels.length).join(' · ')}
                                {channels.length > (compact ? 3 : channels.length) && ` +${channels.length - 3}`}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {entries.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: compact ? 10 : 12
                }}>
                    {entries.map((e, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 14,
                            padding: compact ? 12 : 14,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Hash size={14} color="var(--accent-1)" />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{e.day || `Entry ${i + 1}`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    {pill(e.channel || 'Channel')}
                                    {pill(e.content_type || 'Content')}
                                </div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{e.topic}</span>
                            {e.caption_idea && (
                                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                    {e.caption_idea}
                                </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {e.hashtags?.slice(0, compact ? 4 : e.hashtags.length).map((h, idx) => pill(h.startsWith('#') ? h : `#${h}`))}
                                {e.best_time && (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '4px 8px', borderRadius: 10,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.04)',
                                        fontSize: 11, color: 'var(--text-secondary)'
                                    }}>
                                        <Clock size={12} /> {e.best_time}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Target size={14} color="var(--accent-1)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                            </div>
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}

            {recs.length > 0 && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ListChecks size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Next steps</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recs.map((r, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8 }}>
                                <Sparkles size={12} color="var(--accent-1)" style={{ marginTop: 2 }} />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
