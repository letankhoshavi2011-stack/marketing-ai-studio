import React from 'react';
import { Instagram, Type, Copy, CheckCircle, Sparkles } from 'lucide-react';

interface Props {
    data: any;
    compact?: boolean;
}

export const InstagramBioOutput: React.FC<Props> = ({ data, compact = false }) => {
    if (!data) return null;

    const posts = data.posts?.length > 0 ? data.posts : data.post ? [data.post] : [];
    const alternateCaptions = data.alternate_captions || [];
    const sections = data.sections || [];

    // For bio agent, the primary bio text may be in data.bio or in the first post caption
    const primaryBio = data.bio || data.bio_text || (posts.length > 0 ? posts[0].caption : null);
    const bioOptions: string[] = [];
    if (primaryBio) bioOptions.push(primaryBio);
    alternateCaptions.forEach((c: string) => {
        if (c !== primaryBio) bioOptions.push(c);
    });
    // Also check posts for additional captions
    posts.forEach((p: any) => {
        if (p.caption && !bioOptions.includes(p.caption)) {
            bioOptions.push(p.caption);
        }
    });

    const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header */}
            <div style={{
                padding: compact ? 12 : 14, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(124,92,255,0.06))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Instagram size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Instagram — Bio
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {bioOptions.length} Bio Option{bioOptions.length !== 1 ? 's' : ''} Generated
                    </span>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 700, color: '#E1306C',
                    background: 'rgba(225,48,108,0.1)', padding: '4px 10px', borderRadius: 99
                }}>
                    <Type size={12} /> Text Only
                </span>
            </div>

            {/* Bio options */}
            {bioOptions.map((bio, idx) => {
                const charCount = bio.length;
                const isOverLimit = charCount > 150; // Instagram bio limit

                return (
                    <div key={idx} style={{
                        border: '1px solid var(--border-default)', borderRadius: 14,
                        background: 'var(--bg-secondary)', overflow: 'hidden'
                    }}>
                        {/* Option header */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(0,0,0,0.02))',
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {idx === 0 ? (
                                    <Sparkles size={14} color="#E1306C" />
                                ) : (
                                    <Instagram size={14} color="#E1306C" />
                                )}
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#E1306C', textTransform: 'uppercase' }}>
                                    {idx === 0 ? 'Primary Bio' : `Option ${idx + 1}`}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: isOverLimit ? '#ef4444' : 'var(--text-muted)'
                                }}>
                                    {charCount}/150 chars
                                </span>
                                <button
                                    onClick={() => handleCopy(bio, idx)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, fontWeight: 600,
                                        color: copiedIdx === idx ? '#22c55e' : 'var(--text-muted)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '2px 6px', borderRadius: 4
                                    }}
                                >
                                    {copiedIdx === idx ? <CheckCircle size={12} /> : <Copy size={12} />}
                                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* Bio text — prominent display */}
                        <div style={{ padding: '20px 18px' }}>
                            <p style={{
                                fontSize: 15, color: 'var(--text-primary)',
                                lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0,
                                fontWeight: 500, textAlign: 'center'
                            }}>
                                {bio}
                            </p>
                        </div>

                        {/* Character bar */}
                        <div style={{ padding: '0 14px 12px' }}>
                            <div style={{
                                width: '100%', height: 4, borderRadius: 2,
                                background: 'var(--bg-primary)', overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${Math.min((charCount / 150) * 100, 100)}%`,
                                    height: '100%', borderRadius: 2,
                                    background: isOverLimit
                                        ? 'linear-gradient(90deg, #E1306C, #ef4444)'
                                        : 'linear-gradient(90deg, #E1306C, #C13584)',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Fallback: sections */}
            {bioOptions.length === 0 && sections.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.title && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                    {sections.map((s: any, i: number) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)', borderRadius: 12,
                            padding: compact ? 10 : 12, background: 'var(--bg-secondary)',
                            display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                            {s.heading && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading}</span>}
                            {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{s.content}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
