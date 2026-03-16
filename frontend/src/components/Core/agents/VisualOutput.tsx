import React from 'react';
import { Image as ImageIcon, Video, Sparkles, Palette, Ruler } from 'lucide-react';
import MediaSlider from '../../MediaSlider';

interface VisualOutputProps {
    title?: string;
    reasoning?: string;
    assets: { type: 'image' | 'video'; url: string }[];
    aspect_ratio?: string;
    design_style?: string;
    compact?: boolean;
    context_updates?: Record<string, any>;
}

export function VisualOutput({
    title = 'Visual Concepts',
    reasoning,
    assets,
    aspect_ratio,
    design_style,
    compact = false,
    context_updates
}: VisualOutputProps) {
    const imgCount = assets?.filter(a => a.type === 'image').length || 0;
    const vidCount = assets?.filter(a => a.type === 'video').length || 0;
    const contextEntries = context_updates ? Object.entries(context_updates).filter(([_, v]) => v !== undefined && v !== null) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {contextEntries.length > 0 && (
                <div style={{
                    padding: compact ? 10 : 12,
                    borderRadius: 12,
                    border: '1px solid rgba(34,197,94,0.25)',
                    background: 'rgba(34,197,94,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap'
                }}>
                    <Sparkles size={16} color="#22c55e" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Saved to Brand Context</span>
                        <pre style={{
                            margin: 0,
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-secondary)',
                            fontSize: 11,
                            maxHeight: 140,
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap'
                        }}>
{JSON.stringify(Object.fromEntries(contextEntries), null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: compact ? 12 : 14,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.12))',
                border: '1px solid rgba(124,92,255,0.18)',
                boxShadow: '0 8px 24px rgba(124,92,255,0.12)',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 220 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: 'var(--bg-primary)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {vidCount > 0 ? <Video size={18} color="var(--accent-1)" /> : <ImageIcon size={18} color="var(--accent-1)" />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h3 style={{ margin: 0, fontSize: compact ? 16 : 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {aspect_ratio && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '4px 8px', borderRadius: 10,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    fontSize: 12, color: 'var(--text-secondary)'
                                }}>
                                    <Ruler size={12} /> AR: {aspect_ratio}
                                </span>
                            )}
                            {design_style && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '4px 8px', borderRadius: 10,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    fontSize: 12, color: 'var(--text-secondary)'
                                }}>
                                    <Palette size={12} /> Style: {design_style}
                                </span>
                            )}
                        </div>
                        {reasoning && (
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {reasoning}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.04)',
                        fontSize: 12,
                        color: 'var(--text-secondary)'
                    }}>
                        {imgCount} images
                    </span>
                    {vidCount > 0 && (
                        <span style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.04)',
                            fontSize: 12,
                            color: 'var(--text-secondary)'
                        }}>
                            {vidCount} videos
                        </span>
                    )}
                </div>
            </div>

                    {assets?.length > 0 && <MediaSlider items={assets} />}
        </div>
    );
}
