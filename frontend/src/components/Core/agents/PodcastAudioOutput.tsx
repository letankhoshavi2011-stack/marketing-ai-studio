import React from 'react';
import { Mic, List, Hash, Video, Clock, Bookmark, Sparkles, FileText, FastForward } from 'lucide-react';

interface ScriptSegment {
    time?: string;
    speaker?: string;
    text?: string;
}

interface VideoScene {
    scene_number?: number;
    visual_description?: string;
    audio_voiceover?: string;
    duration_seconds?: number;
    on_screen_text?: string;
}

interface PodcastAudioOutputProps {
    data: {
        // AudioOutput
        script_segments?: ScriptSegment[];
        show_notes?: string;
        seo_tags?: string[];
        // VideoScriptOutput & VideoToolsOutput
        title?: string;
        hook?: string;
        scenes?: VideoScene[];
        cta?: string;
        seo_description?: string;
        summary?: string;
        chapters?: { timestamp?: string; title?: string }[];
        snippets?: { start?: number; end?: number; reason?: string }[];
    };
    compact?: boolean;
}

export const PodcastAudioOutput: React.FC<PodcastAudioOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    const hasAudio = data.script_segments && data.script_segments.length > 0;
    const hasVideoScript = data.scenes && data.scenes.length > 0;
    const hasSummary = data.summary || (data.chapters && data.chapters.length > 0) || (data.snippets && data.snippets.length > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Header block for title / notes / summary */}
            {(data.title || data.show_notes || data.summary || data.hook || data.cta || data.seo_description) && (
                <div style={{
                    padding: compact ? 12 : 16,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(234,88,12,0.1), rgba(249,115,22,0.05))',
                    border: '1px solid rgba(234,88,12,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(234,88,12,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            {hasVideoScript || hasSummary ? <Video size={16} color="#f97316" /> : <Mic size={16} color="#f97316" />}
                        </div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {data.title || 'Audio / Video Script'}
                        </h3>
                    </div>

                    {data.hook && (
                        <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Video Hook</span>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>{data.hook}</div>
                        </div>
                    )}
                    {(data.show_notes || data.summary || data.seo_description) && (
                        <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</span>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
                                {data.show_notes || data.summary || data.seo_description}
                            </div>
                        </div>
                    )}
                    {data.cta && (
                        <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call to Action</span>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>{data.cta}</div>
                        </div>
                    )}
                    {data.seo_tags && data.seo_tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                            {data.seo_tags.map((tag, i) => (
                                <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Audio Script Segments */}
            {hasAudio && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Script Segments
                    </div>
                    {data.script_segments!.map((seg, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                                    <List size={14} />
                                    {seg.speaker || 'Speaker'}
                                </div>
                                {seg.time && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} /> {seg.time}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {seg.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Script Scenes */}
            {hasVideoScript && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Video Scenes
                    </div>
                    {data.scenes!.map((scene, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#f97316' }}>
                                    <Video size={14} /> Scene {scene.scene_number || i + 1}
                                </div>
                                {scene.duration_seconds && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} /> {scene.duration_seconds}s
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {scene.visual_description && (
                                    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                        <Video size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scene.visual_description}</div>
                                    </div>
                                )}
                                {scene.audio_voiceover && (
                                    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                        <Mic size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <div style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>"{scene.audio_voiceover}"</div>
                                    </div>
                                )}
                                {scene.on_screen_text && (
                                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                                        <FileText size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>Text: {scene.on_screen_text}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Tools Output (Summarizer / Chapters / Snippets) */}
            {(data.chapters?.length || data.snippets?.length) ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {data.chapters && data.chapters.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>
                                <Bookmark size={14} color="#f97316" /> Chapters
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {data.chapters.map((ch, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            {ch.timestamp || '0:00'}
                                        </div>
                                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{ch.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.snippets && data.snippets.length > 0 && (
                        <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>
                                <FastForward size={14} color="#f97316" /> Key Snippets
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {data.snippets.map((sn, i) => (
                                    <div key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>
                                            <Clock size={11} />
                                            {sn.start || 0}s - {sn.end || 0}s
                                        </div>
                                        <div>{sn.reason}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};
