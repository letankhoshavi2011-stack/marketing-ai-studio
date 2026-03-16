import React from 'react';
import { Palette, Shapes, Lightbulb, Sparkles } from 'lucide-react';
import MediaSlider from '../../MediaSlider';
import RichTextEditor from '../../RichTextEditor';

type MediaItem = { type: 'image' | 'video'; url: string };

interface LogoDesignerOutputProps {
    images: MediaItem[];
    status: 'draft' | 'final';
    textContent?: string;
    onTextChange?: (content: string) => void;
    data?: any;
}

const chip = (text: string) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-primary)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
    }}>
        {text}
    </span>
);

export function LogoDesignerOutput({
    images,
    status,
    textContent,
    onTextChange,
    data = {}
}: LogoDesignerOutputProps) {
    const brandName = data.brand_name || data.title || 'Logo Concepts';
    const styles = data.styles || data.style || [];
    const colors = data.colors || data.color_palette || data.palette || [];
    const iconConcept = data.icon_concept || data.icon || data.symbol;
    const usage = data.usage_context || data.use_case;
    const reasoning = data.reasoning || data.notes || data.prompt_reasoning;
    const prompt = data.image_prompt || data.prompt;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{
                padding: 14,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(56,189,248,0.12))',
                border: '1px solid rgba(124,92,255,0.25)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shapes size={20} color="var(--accent-1)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Logo Designer</span>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{brandName}</h3>
                        {(iconConcept || usage) && (
                            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                                {iconConcept && `Icon: ${iconConcept}`}{iconConcept && usage ? ' • ' : ''}{usage && `Usage: ${usage}`}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {Array.isArray(styles) && styles.map((s: string, i: number) => chip(s))}
                    {images?.length ? chip(`${images.length} variation${images.length > 1 ? 's' : ''}`) : null}
                </div>
            </div>

            {/* Palette */}
            {Array.isArray(colors) && colors.length > 0 && (
                <div style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Palette size={16} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Color palette</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {colors.map((c: any, i: number) => {
                            const hex = typeof c === 'string' ? c : c.hex || '#000';
                            const name = typeof c === 'string' ? c : c.name;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: hex,
                                        border: '1px solid rgba(255,255,255,0.25)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                                    }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{hex}</span>
                                        {name && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{name}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Prompt & notes */}
            {(reasoning || prompt) && (
                <div style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lightbulb size={16} color="var(--primary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Rationale & Prompt</span>
                    </div>
                    {reasoning && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{reasoning}</p>}
                    {prompt && (
                        <pre style={{
                            margin: 0,
                            padding: 10,
                            borderRadius: 10,
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'var(--text-secondary)',
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5
                        }}>{prompt}</pre>
                    )}
                </div>
            )}

            {/* Optional editable notes */}
            {onTextChange && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color="var(--accent-1)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Creative notes</span>
                        {status !== 'final' && (
                            <span style={{ fontSize: 11, color: 'var(--accent-1)', fontWeight: 700, textTransform: 'uppercase' }}>Editable</span>
                        )}
                    </div>
                    <RichTextEditor
                        content={textContent || ''}
                        onChange={onTextChange}
                        editable={status !== 'final'}
                    />
                </div>
            )}

            {/* Gallery */}
            {images.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shapes size={16} color="var(--primary)" />
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Logo Variations</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {images.length} image{images.length === 1 ? '' : 's'}
                        </span>
                    </div>
                    <MediaSlider items={images} />
                </div>
            )}
        </div>
    );
}
