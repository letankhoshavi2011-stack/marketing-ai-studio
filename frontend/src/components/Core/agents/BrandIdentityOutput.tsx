import React, { useState } from 'react';
import {
    CheckCircle2, XCircle, Palette, Type, Heart, Eye,
    Image, Star, BookOpen, Download, Save, RefreshCw,
    AlertTriangle, Sparkles
} from 'lucide-react';

/* ────────────────────────────────────────────────────────── */
/* TYPES                                                        */
/* ────────────────────────────────────────────────────────── */

interface ColorSwatch {
    hex: string;
    name: string;
    usage: string;
}

interface FontPair {
    heading: string;
    body: string;
    heading_weight?: string;
    body_weight?: string;
}

interface BrandIdentityData {
    brand_name?: string;
    tagline_idea?: string;
    brand_personality?: string;
    mood?: string;
    visual_style?: string;
    imagery_direction?: string;
    colors?: ColorSwatch[];
    fonts?: FontPair;
    values?: string[];
    dos?: string[];
    donts?: string[];
    text_content?: string;
    success?: boolean;
    error?: string;
}

interface Props {
    data: BrandIdentityData;
    compact?: boolean;
    onSaveToWorkspace?: () => void;
    isSaving?: boolean;
}

/* ────────────────────────────────────────────────────────── */
/* SECTION HEADER                                              */
/* ────────────────────────────────────────────────────────── */

function SectionHeader({ icon: Icon, label, color = 'var(--primary)', compact }: { icon: any; label: string; color?: string; compact?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 8 : 16 }}>
            <div style={{
                width: compact ? 24 : 30, height: compact ? 24 : 30, borderRadius: 8,
                background: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={compact ? 12 : 15} color={color} />
            </div>
            <span style={{ fontSize: compact ? 10 : 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                {label}
            </span>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* COLOR PALETTE CARD                                          */
/* ────────────────────────────────────────────────────────── */

function ColorPaletteCard({ colors, compact }: { colors: ColorSwatch[]; compact?: boolean }) {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div>
            {/* Large palette bar */}
            <div style={{
                display: 'flex', borderRadius: 12, overflow: 'hidden',
                height: compact ? 40 : 60, marginBottom: compact ? 10 : 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
                {colors.map(c => (
                    <div key={c.hex} style={{ flex: 1, background: c.hex }} title={`${c.name} (${c.hex})`} />
                ))}
            </div>

            {/* Individual swatches - only show if not compact or if we want to show them */}
            {!compact && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {colors.map(c => (
                        <button
                            key={c.hex}
                            type="button"
                            onClick={() => copy(c.hex)}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 10,
                                padding: '10px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 0.15s',
                            }}
                            className="hover:scale-[1.03]"
                            title="Click to copy hex code"
                        >
                            <div style={{
                                width: '100%', height: 40,
                                borderRadius: 6,
                                background: c.hex,
                                marginBottom: 8,
                            }} />
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{c.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0', fontFamily: 'monospace' }}>
                                {copied === c.hex ? '✓ Copied!' : c.hex}
                            </p>
                            <span style={{
                                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                                background: `${c.hex}30`, color: c.hex, border: `1px solid ${c.hex}50`,
                            }}>
                                {c.usage}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* FONT PREVIEW CARD                                           */
/* ────────────────────────────────────────────────────────── */

function FontPreviewCard({ fonts, compact }: { fonts: FontPair; compact?: boolean }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? 10 : 16 }}>
            {[
                { role: 'Heading', name: fonts.heading, weight: fonts.heading_weight || '700', sample: compact ? 'Bold. Impactful.' : 'Bold. Impactful. Memorable.' },
                { role: 'Body', name: fonts.body, weight: fonts.body_weight || '400', sample: compact ? 'Clear, readable.' : 'Clear, readable, and professional. Great for longer paragraphs of text.' }
            ].map(f => (
                <div key={f.role} style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 10, padding: compact ? 12 : 16,
                }}>
                    <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{f.role} Font</span>
                    <p style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: 'var(--primary)', margin: '2px 0 8px', fontFamily: 'monospace' }}>{f.name}</p>
                    <p style={{
                        fontSize: f.role === 'Heading' ? (compact ? 15 : 18) : (compact ? 12 : 14),
                        fontWeight: parseInt(f.weight),
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                        margin: 0,
                        fontFamily: `'${f.name}', sans-serif`,
                    }}>
                        {f.sample}
                    </p>
                </div>
            ))}
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* DO / DON'T CARD                                             */
/* ────────────────────────────────────────────────────────── */

function DosDonts({ dos, donts }: { dos: string[]; donts: string[] }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#2ecc71', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ✓ Always Do
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dos.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <CheckCircle2 size={14} color="#2ecc71" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{d}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e74c3c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ✗ Never Do
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {donts.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <XCircle size={14} color="#e74c3c" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{d}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/* MAIN OUTPUT VIEWER                                          */
/* ────────────────────────────────────────────────────────── */

export const BrandIdentityOutput: React.FC<Props> = ({ data, compact, onSaveToWorkspace, isSaving }) => {
    // Error state
    if (!data.success && data.error) {
        return (
            <div style={{ padding: compact ? 16 : 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                <AlertTriangle size={compact ? 24 : 40} color="#e67e22" />
                <h3 style={{ fontSize: compact ? 14 : 18, fontWeight: 700, color: 'var(--text-primary)' }}>Generation Failed</h3>
                <p style={{ fontSize: compact ? 12 : 14, color: 'var(--text-secondary)', maxWidth: 400 }}>{data.error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: compact ? '16px 20px' : '24px 28px', display: 'flex', flexDirection: 'column', gap: compact ? 20 : 28 }}>

            {/* ── BRAND HEADER ── */}
            {!compact && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(124,92,255,0.03) 100%)',
                    border: '1px solid rgba(124,92,255,0.25)',
                    borderRadius: 16, padding: '24px 28px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <Sparkles size={20} color="var(--primary)" />
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                                    Brand Identity
                                </span>
                            </div>
                            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                {data.brand_name || 'Your Brand'}
                            </h1>
                            {data.tagline_idea && (
                                <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '8px 0 0', fontStyle: 'italic' }}>
                                    "{data.tagline_idea}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Personality and mood pills */}
                    {(data.brand_personality || data.mood) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                            {data.brand_personality && (
                                <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(124,92,255,0.15)', color: 'var(--primary)', border: '1px solid rgba(124,92,255,0.3)' }}>
                                    🎯 {data.brand_personality}
                                </span>
                            )}
                            {data.mood && (
                                <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(46,204,113,0.1)', color: '#27ae60', border: '1px solid rgba(46,204,113,0.3)' }}>
                                    ✨ {data.mood}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── COLOR PALETTE ── */}
            {data.colors && data.colors.length > 0 && (
                <div>
                    <SectionHeader icon={Palette} label="Brand Color Palette" color="#9b59b6" compact={compact} />
                    <ColorPaletteCard colors={data.colors} compact={compact} />
                </div>
            )}

            {/* ── TYPOGRAPHY ── */}
            {data.fonts && (
                <div>
                    <SectionHeader icon={Type} label="Typography" color="#3498db" compact={compact} />
                    <FontPreviewCard fonts={data.fonts} compact={compact} />
                </div>
            )}

            {/* ── VISUAL STYLE & IMAGERY ── */}
            {(data.visual_style || data.imagery_direction) && !compact && (
                <div>
                    <SectionHeader icon={Eye} label="Visual Direction" color="#e67e22" compact={compact} />
                    <div style={{ display: 'grid', gridTemplateColumns: data.visual_style && data.imagery_direction ? '1fr 1fr' : '1fr', gap: 16 }}>
                        {data.visual_style && (
                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 16 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>Visual Style</p>
                                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{data.visual_style}</p>
                            </div>
                        )}
                        {data.imagery_direction && (
                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 16 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>Imagery Direction</p>
                                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{data.imagery_direction}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── BRAND VALUES ── */}
            {data.values && data.values.length > 0 && (
                <div>
                    <SectionHeader icon={Heart} label="Brand Values" color="#e74c3c" compact={compact} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 6 : 10 }}>
                        {data.values.map((v, i) => (
                            <span key={i} style={{
                                padding: compact ? '4px 10px' : '8px 16px', borderRadius: 20,
                                background: 'var(--bg-primary)',
                                border: '1.5px solid var(--border-default)',
                                fontSize: compact ? 11 : 13, fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}>
                                {v}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── DOs & DON'Ts ── */}
            {(data.dos?.length || data.donts?.length) && !compact && (
                <div>
                    <SectionHeader icon={BookOpen} label="Brand Guidelines" color="#27ae60" compact={compact} />
                    <DosDonts dos={data.dos || []} donts={data.donts || []} />
                </div>
            )}

            {/* ── SAVE TO WORKSPACE ACTION ── */}
            {onSaveToWorkspace && !compact && (
                <div style={{ marginTop: 12, padding: '0 0 20px' }}>
                    <button
                        onClick={onSaveToWorkspace}
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: 14,
                            background: isSaving
                                ? 'var(--border-default)'
                                : 'linear-gradient(135deg, #7c5cff 0%, #6a4fff 50%, #8b6aff 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 16,
                            letterSpacing: '0.02em',
                            border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            transition: 'all 0.25s ease',
                            boxShadow: isSaving ? 'none' : '0 10px 25px rgba(124,92,255,0.3)',
                        }}
                    >
                        {isSaving ? (
                            <><RefreshCw size={20} className="animate-spin" /> Saving Identity...</>
                        ) : (
                            <><CheckCircle2 size={20} /> Use This Brand Identity</>
                        )}
                    </button>
                </div>
            )}

        </div>
    );
};
