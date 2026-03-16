/**
 * DeckCardNode — Premium canvas card with markdown preview.
 *
 * Design:
 *  • XL 720px card for better readability
 *  • Dark glassmorphism body with subtle gradient
 *  • Coloured gradient top bar per agent category
 *  • Agent icon with glow badge
 *  • Scrollable markdown preview (heading, bold, lists, inline code)
 *  • Animated generating / empty states
 *  • Smooth hover lift + accent border
 */

import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Palette, Share2, PenTool, Video, FileText, CheckCircle,
    Clock, Sparkles, Bot, Zap, Edit3, Fingerprint,
    Type, Quote, Users, Shield, Lightbulb, Target,
    Camera, Layout, Crop, MonitorSmartphone,
    Mic, Pen, Image as ImageIcon, Database, Maximize, Trash2, Copy, Check, Rocket,
} from 'lucide-react';
import { marked } from 'marked';
import MediaSlider from '../MediaSlider';
import { BrandIdentityOutput } from '../Core/agents/BrandIdentityOutput';
import { SEOOutput } from '../Core/agents/SEOOutput';
import { SmartOutput } from '../Core/agents/SmartOutput';
import { VisualOutput } from '../Core/agents/VisualOutput';
import { BrandNamingOutput } from '../Core/agents/BrandNamingOutput';
import { TaglineOutput } from '../Core/agents/TaglineOutput';
import { TargetAudienceOutput } from '../Core/agents/TargetAudienceOutput';
import { BrandVoiceOutput } from '../Core/agents/BrandVoiceOutput';
import { BrandGuardianOutput } from '../Core/agents/BrandGuardianOutput';
import { CampaignConceptOutput } from '../Core/agents/CampaignConceptOutput';
import { ContentCalendarOutput } from '../Core/agents/ContentCalendarOutput';
import { ImageGeneratorOutput } from '../Core/agents/ImageGeneratorOutput';
import { GrowthOutput } from '../Core/agents/GrowthOutput';
import { ABTestSetupOutput } from '../Core/agents/ABTestSetupOutput';
import { ColdEmailOutput } from '../Core/agents/ColdEmailOutput';
import EmailSequenceOutput from '../Core/agents/EmailSequenceOutput';
import { PageCROOutput } from '../Core/agents/PageCROOutput';
import { LaunchStrategyOutput } from '../Core/agents/LaunchStrategyOutput';
import { ContentOutput } from '../Core/agents/ContentOutput';
import { VideoScriptOutput } from '../Core/agents/VideoScriptOutput';
import { VideoTrendAnalyzerOutput } from '../Core/agents/VideoTrendAnalyzerOutput';
import ReferralProgramOutput from '../Core/agents/ReferralProgramOutput';

/* ─────────────────────────────────────────────────── */
/* Types                                               */
/* ─────────────────────────────────────────────────── */

export interface DeckCardData extends Record<string, unknown> {
    id: string;
    card_type: string;
    title: string;
    status: 'empty' | 'generating' | 'draft' | 'needs_update' | 'final';
    agent_used?: string;
    thumbnail_url?: string;
    text_preview?: string;
    structured_data?: any;
    mediaItems?: { type: 'image' | 'video'; url: string }[];
    onOpen?: (cardId: string, agentUsed?: string) => void;
    onDelete?: (cardId: string, title: string) => void;
}

/* ─────────────────────────────────────────────────── */
/* Agent accent colours                                */
/* ─────────────────────────────────────────────────── */

const AGENT_COLORS: Record<string, string> = {
    // Brand
    brand_identity: '#f87171', brand_naming: '#f87171',
    tagline_slogan: '#f87171', target_audience: '#f87171',
    brand_voice: '#f87171', brand_guardian: '#f87171',
    // Creative
    creative_direction: '#fbbf24', campaign_concept: '#fbbf24',
    content_calendar: '#fbbf24', market_research: '#fbbf24',
    launch_strategy: '#fbbf24',
    // Visual
    logo_designer: '#38bdf8', hero_image: '#38bdf8',
    product_photoshoot: '#38bdf8', ad_creative: '#38bdf8',
    image_editor: '#38bdf8', mockup_generator: '#38bdf8',
    infographic: '#38bdf8',
    // Social
    instagram_post: '#e879f9', instagram_story: '#e879f9',
    instagram_reel: '#e879f9', instagram_carousel: '#e879f9',
    instagram_bio: '#e879f9',
    // Content
    blog_writer: '#34d399', seo_optimizer: '#34d399',
    email_campaign: '#34d399', ad_copy: '#34d399',
    landing_page: '#34d399', video_script: '#34d399',
};

const getColor = (id?: string) => (id ? AGENT_COLORS[id] ?? '#7c5cfc' : '#7c5cfc');

/* ─────────────────────────────────────────────────── */
/* Agent icons                                         */
/* ─────────────────────────────────────────────────── */

const AGENT_ICONS: Record<string, React.ElementType> = {
    brand_identity: Fingerprint, brand_naming: Type,
    tagline_slogan: Quote, target_audience: Users,
    brand_voice: Mic, brand_guardian: Shield,
    creative_direction: Lightbulb, campaign_concept: Target,
    content_calendar: Database, launch_strategy: Rocket, logo_designer: PenTool,
    hero_image: ImageIcon, product_photoshoot: Camera,
    ad_creative: Layout, image_editor: Crop,
    mockup_generator: MonitorSmartphone, infographic: Database,
    instagram_post: ImageIcon, instagram_story: Sparkles,
    instagram_reel: Video, instagram_carousel: Layout,
    instagram_bio: Pen, blog_writer: FileText,
    email_campaign: Share2, ad_copy: PenTool,
};

const getIcon = (id?: string): React.ElementType =>
    id ? AGENT_ICONS[id] ?? Bot : Bot;

/* ─────────────────────────────────────────────────── */
/* Status config                                       */
/* ─────────────────────────────────────────────────── */

const STATUS: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    final: { label: 'Finalized', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', Icon: CheckCircle },
    draft: { label: '', color: '#f59e0b', bg: 'rgba(251,191,36,0.12)', Icon: Clock },
    generating: { label: 'Thinking…', color: '#7c5cfc', bg: 'rgba(124,92,252,0.12)', Icon: Sparkles },
    needs_update: { label: 'Stale', color: '#f97316', bg: 'rgba(249,115,22,0.12)', Icon: Zap },
    empty: { label: 'Empty', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', Icon: FileText },
};

const CARD_WIDTH = 720;
const CONTENT_MAX_HEIGHT = 480;
const MEDIA_HEIGHT = 380;

/* ─────────────────────────────────────────────────── */
/* Markdown → sanitised HTML (inline only for preview) */
/* ─────────────────────────────────────────────────── */

const MD_STYLE = `
.deckcard-md::-webkit-scrollbar {
    width: 5px;
}
.deckcard-md::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
}
.deckcard-md::-webkit-scrollbar-thumb {
    background: rgba(124, 92, 252, 0.35);
    border-radius: 4px;
}
.deckcard-md::-webkit-scrollbar-thumb:hover {
    background: rgba(124, 92, 252, 0.55);
}
.deckcard-md h1,.deckcard-md h2,.deckcard-md h3 {
    font-size:15px; font-weight:800; color:rgba(255,255,255,0.96);
    margin:0 0 10px; line-height:1.6;
}
.deckcard-md h1 { font-size:19px; }
.deckcard-md h2 { font-size:17px; }
.deckcard-md h3 { font-size:15px; }
.deckcard-md p { margin:0 0 12px; font-size:14.5px; line-height:1.9; color:rgba(255,255,255,0.76); }
.deckcard-md p:last-child { margin-bottom:0; }
.deckcard-md ul,.deckcard-md ol { margin:0 0 12px 22px; padding:0; }
.deckcard-md li { font-size:14px; color:rgba(255,255,255,0.76); line-height:1.9; margin-bottom:5px; }
.deckcard-md li::marker { color: rgba(124,92,252,0.6); }
.deckcard-md strong { color:rgba(255,255,255,0.95); font-weight:800; }
.deckcard-md em { color:rgba(255,255,255,0.6); font-style:italic; }
.deckcard-md code { font-family:'JetBrains Mono',monospace; font-size:12.5px; background:rgba(255,255,255,0.1);
    padding:3px 9px; border-radius:7px; color:rgba(220,200,255,0.95); }
.deckcard-md pre { background:rgba(255,255,255,0.06); padding:14px 16px; border-radius:12px;
    margin:0 0 10px; overflow-x:auto; }
.deckcard-md pre code { background:none; padding:0; font-size:12px; }
.deckcard-md blockquote { border-left:4px solid rgba(124,92,252,0.4); padding-left:14px;
    margin:0 0 12px; color:rgba(255,255,255,0.6); font-size:13.5px; font-style:italic; }
.deckcard-md hr { border:none; border-top:1px solid rgba(255,255,255,0.12); margin:14px 0; }
.deckcard-md a { color:rgba(124,92,252,1); text-decoration:none; font-weight:600; }
.deckcard-md a:hover { text-decoration:underline; }
.deckcard-md table { width:100%; border-collapse:collapse; margin:0 0 12px; font-size:13px; }
.deckcard-md th,.deckcard-md td { padding:6px 10px; border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); text-align:left; }
.deckcard-md th { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.88); font-weight:800; font-size:12.5px; }
`;

let styleInjected = false;
function ensureStyle() {
    if (styleInjected) return;
    const s = document.createElement('style');
    s.textContent = MD_STYLE;
    document.head.appendChild(s);
    styleInjected = true;
}

function MarkdownPreview({ content, accent }: { content: string; accent: string }) {
    ensureStyle();

    const html = useMemo(() => {
        try {
            return marked.parse(content, { breaks: true }) as string;
        } catch {
            return `<p>${content}</p>`;
        }
    }, [content]);

    return (
        <div
            className="deckcard-md nodrag"
            style={{
                width: '100%',
                maxHeight: CONTENT_MAX_HEIGHT,
                overflowY: 'auto',
                paddingRight: 6,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '14px',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}


/* ─────────────────────────────────────────────────── */
/* Loading dots animation                              */
/* ─────────────────────────────────────────────────── */

function LoadingDots({ color }: { color: string }) {
    return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', height: 140 }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    display: 'inline-block',
                    width: 9, height: 9, borderRadius: '50%',
                    background: color,
                    animation: `deckcard-bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                }} />
            ))}
            <style>{`
                @keyframes deckcard-bounce {
                    0%,80%,100% { transform:translateY(0); opacity:0.6; }
                    40% { transform:translateY(-10px); opacity:1; }
                }
            `}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────── */
/* Line-skeleton shimmer (empty state content area)    */
/* ─────────────────────────────────────────────────── */

function SkeletonLines() {
    const widths = ['80%', '95%', '65%', '88%', '55%', '72%'];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 0' }}>
            {widths.map((w, i) => (
                <div key={i} style={{
                    height: 12, borderRadius: 6,
                    width: w,
                    background: 'rgba(255,255,255,0.06)',
                    animation: `deckcard-shimmer 1.6s ease-in-out ${i * 0.1}s infinite alternate`,
                }} />
            ))}
            <style>{`
                @keyframes deckcard-shimmer {
                    from { opacity:0.4; } to { opacity:0.9; }
                }
            `}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────── */
/* MAIN COMPONENT                                      */
/* ─────────────────────────────────────────────────── */

export default function DeckCardNode({ data, selected }: { data: DeckCardData; selected: boolean }) {
    const [copied, setCopied] = React.useState(false);

    const accent = getColor(data.agent_used);
    const AgentIcon = getIcon(data.agent_used);
    const statusCfg = STATUS[data.status] ?? STATUS.empty;
    const StatusIcon = statusCfg.Icon;
    const isGen = data.status === 'generating';
    const isVisualMediaAgent = ['hero_image', 'ad_creative', 'product_photoshoot', 'mockup_generator', 'image_generator'].includes(data.agent_used || '');
    const showMediaPreview = !!(data.mediaItems && data.mediaItems.length > 0 && !isVisualMediaAgent);
    const showThumbnail = !!data.thumbnail_url && !isVisualMediaAgent;
    const hasContent = !!data.text_preview || showThumbnail || showMediaPreview;

    const handleClick = () => data.onOpen?.(data.id, data.agent_used);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!data.text_preview) return;
        navigator.clipboard.writeText(data.text_preview);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const agentLabel = data.agent_used?.replace(/_/g, ' ') || '';

    const baseStyle: React.CSSProperties = {
        width: CARD_WIDTH,
        borderRadius: 28,
        background: 'linear-gradient(160deg, rgba(16,16,28,0.98) 0%, rgba(8,8,18,0.97) 100%)',
        backdropFilter: 'blur(34px)',
        WebkitBackdropFilter: 'blur(34px)',
        border: selected
            ? `2px solid ${accent}`
            : '1px solid rgba(255,255,255,0.12)',
        boxShadow: selected
            ? `0 0 0 8px ${accent}26, 0 44px 108px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.05) inset`
            : '0 26px 74px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset',
        cursor: 'grab',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        position: 'relative',
    };

    const contentSurface: React.CSSProperties = {
        maxHeight: CONTENT_MAX_HEIGHT,
        overflowY: 'auto',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 14,
    };

    return (
        <div
            style={baseStyle}
            onMouseEnter={e => {
                if (selected) return;
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-4px) scale(1.005)';
                el.style.border = `1px solid ${accent}70`;
                el.style.boxShadow = `0 0 0 3px ${accent}20, 0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.1) inset`;
            }}
            onMouseLeave={e => {
                if (selected) return;
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0) scale(1)';
                el.style.border = '1px solid rgba(255,255,255,0.12)';
                el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset';
            }}
        >
            {/* ── React Flow Handles ── */}
            <Handle type="target" position={Position.Left} id="left-t"
                style={{
                    width: 14, height: 14, background: accent,
                    border: '2.5px solid #0d0d16', left: -7,
                    boxShadow: `0 0 8px ${accent}60`,
                    zIndex: 10, cursor: 'crosshair',
                }} />
            <Handle type="source" position={Position.Right} id="right-s"
                style={{
                    width: 14, height: 14, background: accent,
                    border: '2.5px solid #0d0d16', right: -7,
                    boxShadow: `0 0 8px ${accent}60`,
                    zIndex: 10, cursor: 'crosshair',
                }} />
            <Handle type="target" position={Position.Top} id="top-t"
                style={{
                    width: 14, height: 14, background: accent,
                    border: '2.5px solid #0d0d16', top: -7,
                    boxShadow: `0 0 8px ${accent}60`,
                    zIndex: 10, cursor: 'crosshair',
                }} />
            <Handle type="source" position={Position.Bottom} id="bottom-s"
                style={{
                    width: 14, height: 14, background: accent,
                    border: '2.5px solid #0d0d16', bottom: -7,
                    boxShadow: `0 0 8px ${accent}60`,
                    zIndex: 10, cursor: 'crosshair',
                }} />

            {/* ── Accent gradient top bar ── */}
            <div style={{
                height: 6,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 50%, transparent 100%)`,
            }} />

            {/* ── Ambient glow (top-right) ── */}
            <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* ══ HEADER ══ */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 18, padding: '26px 28px 20px',
            }}>
                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: 62, height: 62, borderRadius: 18, flexShrink: 0,
                        background: `${accent}22`,
                        border: `1px solid ${accent}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px ${accent}25`,
                    }}>
                        {isGen
                            ? <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid ${accent}`, borderTopColor: 'transparent', animation: 'deckcard-spin 0.7s linear infinite' }} />
                            : <AgentIcon size={24} color={accent} />
                    }
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{
                            fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.985)',
                            margin: 0, letterSpacing: '-0.02em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {data.title || agentLabel || 'Card'}
                        </p>
                        {data.agent_used && (
                            <p style={{
                                fontSize: 12, fontWeight: 800, color: `${accent}`,
                                textTransform: 'uppercase', letterSpacing: '0.12em', margin: '6px 0 0',
                                opacity: 0.95,
                            }}>
                                {agentLabel}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                    padding: '9px 20px', borderRadius: 28,
                    background: statusCfg.bg,
                    border: `1px solid ${statusCfg.color}40`,
                    boxShadow: `0 2px 10px ${statusCfg.color}15`,
                }}>
                    <StatusIcon size={13} color={statusCfg.color} />
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: statusCfg.color, letterSpacing: '0.08em' }}>
                        {statusCfg.label.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* ── Thin rule ── */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 26px' }} />

            {/* ══ CONTENT ══ */}
            <div style={{ padding: '26px 28px 22px', minHeight: 220 }}>
                {showMediaPreview ? (
                    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: data.text_preview ? 20 : 0, boxShadow: '0 14px 42px rgba(0,0,0,0.38)' }}>
                        <MediaSlider items={data.mediaItems} />
                    </div>
                ) : showThumbnail ? (
                    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: data.text_preview ? 20 : 0, boxShadow: '0 14px 42px rgba(0,0,0,0.38)' }}>
                        <img src={data.thumbnail_url} alt="preview"
                            style={{ width: '100%', height: MEDIA_HEIGHT, objectFit: 'cover', display: 'block' }} />
                    </div>
                ) : null}

                {isGen && !data.mediaItems?.length ? (
                    <LoadingDots color={accent} />
                ) : data.agent_used === 'brand_identity' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()} // allow scrolling inside the card instead of zooming the canvas
                        onMouseDown={e => e.stopPropagation()}    // prevent drag while interacting with scroll area
                    >
                        <BrandIdentityOutput data={data.structured_data} compact />
                    </div>
                ) : ['keyword_researcher', 'on_page_seo', 'technical_seo', 'aeo_optimizer'].includes(data.agent_used || '') && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <SEOOutput data={data.structured_data} compact />
                    </div>
                ) : isVisualMediaAgent ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        {data.agent_used === 'image_generator' ? (
                            <ImageGeneratorOutput data={{ ...data.structured_data, assets: data.mediaItems || [] }} compact />
                        ) : (
                            <VisualOutput
                                compact
                                title={data.title}
                                reasoning={data.structured_data?.reasoning}
                                assets={data.mediaItems || []}
                                aspect_ratio={data.structured_data?.aspect_ratio}
                                design_style={data.structured_data?.design_style || data.structured_data?.style}
                                context_updates={data.structured_data?.context_updates}
                            />
                        )}
                    </div>
                ) : data.agent_used === 'brand_naming' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <BrandNamingOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'tagline_slogan' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <TaglineOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'target_audience' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <TargetAudienceOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'brand_voice' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <BrandVoiceOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'brand_guardian' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <BrandGuardianOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'campaign_concept' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <CampaignConceptOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'content_calendar' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <ContentCalendarOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'launch_strategy' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <LaunchStrategyOutput data={data.structured_data} compact />
                    </div>
                ) : [
                    'blog_post','email_campaign','newsletter','landing_page','case_study','press_release','whitepaper',
                    'product_description','faq_generator','sms_marketing','content_audit'
                ].includes(data.agent_used || '') && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <ContentOutput data={data.structured_data} compact />
                    </div>
                ) : [
                    'video_ad_script','youtube_script','ai_video_gen','caption_generator','thumbnail_idea'
                ].includes(data.agent_used || '') && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <VideoScriptOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'video_trend_analyzer' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <VideoTrendAnalyzerOutput data={data.structured_data} compact />
                    </div>
                ) : [
                    'cold_email',
                ].includes(data.agent_used || '') && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <ColdEmailOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'email_sequence' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <EmailSequenceOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'referral_program' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <ReferralProgramOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'page_cro' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <PageCROOutput data={data.structured_data} compact />
                    </div>
                ) : data.agent_used === 'ab_test_setup' && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <ABTestSetupOutput data={data.structured_data} compact />
                    </div>
                ) : [
                    'pricing_strategy','launch_strategy','content_strategy','marketing_ideas','marketing_psychology',
                    'analytics_tracking','free_tool_strategy','product_marketing_context','copywriting','social_content',
                    'paid_ads','site_architecture','schema_markup','ai_seo','competitor_alternatives','programmatic_seo',
                    'form_cro','onboarding_cro','paywall_upgrade_cro','popup_cro','signup_flow_cro',
                    'churn_prevention','email_sequence','referral_program','revops','sales_enablement'
                ].includes(data.agent_used || '') && data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <GrowthOutput data={data.structured_data} compact />
                    </div>
                ) : data.structured_data ? (
                    <div
                        style={contentSurface}
                        className="nodrag deckcard-md"
                        onWheelCapture={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <SmartOutput data={data.structured_data} compact />
                    </div>
                ) : data.text_preview ? (
                    <MarkdownPreview content={data.text_preview} accent={accent} />
                ) : !data.mediaItems?.length && !data.thumbnail_url ? (
                    <SkeletonLines />
                ) : null}
            </div>

            {/* ══ FOOTER ══ */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 28px 22px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
                {/* Content density bar */}
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {[32, 24, 18, 12, 8].map((w, i) => (
                        <div key={i} style={{
                            height: 3.5, borderRadius: 2, width: w,
                            background: hasContent
                                ? (i < 3 ? `${accent}80` : `${accent}30`)
                                : 'rgba(255,255,255,0.07)',
                        }} />
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* COPY button */}
                    {data.text_preview && (
                        <button
                            className="nodrag"
                            onClick={handleCopy}
                            title="Copy content"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
                                background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                outline: 'none',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                if (!copied) {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!copied) {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                }
                            }}
                        >
                            {copied ? <Check size={12} color="#22c55e" /> : <Copy size={12} color="rgba(255,255,255,0.5)" />}
                        </button>
                    )}

                    {/* DELETE button */}
                    <button
                        className="nodrag"
                        onClick={e => {
                            e.stopPropagation();
                            data.onDelete?.(data.id, data.title || agentLabel || 'this card');
                        }}
                        title="Delete card"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            outline: 'none',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.45)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
                        }}
                    >
                        <Trash2 size={12} color="#ef4444" />
                    </button>

                    {/* OPEN button */}
                    <button
                        className="nodrag"
                        onClick={e => { e.stopPropagation(); handleClick(); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 18px', borderRadius: 14, cursor: 'pointer',
                            background: `${accent}18`,
                            border: `1px solid ${accent}35`,
                            outline: 'none',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = `${accent}30`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = `${accent}18`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${accent}35`;
                        }}
                    >
                        <Edit3 size={12} color={accent} />
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: accent, letterSpacing: '0.06em' }}>
                            OPEN
                        </span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes deckcard-spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
