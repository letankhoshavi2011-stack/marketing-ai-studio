import React from 'react';
import { Film, Clock, Target, Sparkles, ListChecks, Play } from 'lucide-react';

interface Scene {
    scene_number?: number;
    title?: string;
    visual_description?: string;
    audio_voiceover?: string;
}

interface VideoScriptOutputProps {
    data: {
        title?: string;
        hook?: string;
        platform?: string;
        duration?: string;
        tone?: string;
        call_to_action?: string;
        scenes?: Scene[];
        action_items?: string[];
    };
    compact?: boolean;
}

export const VideoScriptOutput: React.FC<VideoScriptOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const scenes = data.scenes || [];
    const actions = data.action_items || [];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            <div style={{
                padding: compact ? 12 : 14,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(124,92,255,0.12))',
                border: '1px solid rgba(124,92,255,0.2)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center'
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Film size={18} color="var(--accent-1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Video Script</span>
                    {data.title && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{data.title}</span>}
                    {data.hook && <span style={{ fontSize: 12.5, color: 'var(--accent-1)' }}>{data.hook}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {data.platform && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{data.platform}</span>}
                    {data.duration && <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {data.duration}</span>}
                    {data.tone && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{data.tone}</span>}
                </div>
            </div>

            {scenes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {scenes.map((s, i) => (
                        <div key={i} style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            padding: compact ? 10 : 12,
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            gap: 10
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 9,
                                background: 'rgba(124,92,255,0.12)',
                                border: '1px solid rgba(124,92,255,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: 'var(--accent-1)'
                            }}>{s.scene_number || i + 1}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.title || 'Scene'}</span>
                                {s.visual_description && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.visual_description}</span>}
                                {s.audio_voiceover && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>VO: {s.audio_voiceover}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(data.call_to_action || actions.length > 0) && (
                <div style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: compact ? 10 : 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex', flexDirection: 'column', gap: 6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>CTA & Next Steps</span>
                    </div>
                    {data.call_to_action && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{data.call_to_action}</span>}
                    {actions.length > 0 && actions.map((a, i) => (
                        <span key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>• {a}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
