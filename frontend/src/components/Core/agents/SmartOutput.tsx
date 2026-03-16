import React from 'react';
import { formatStructuredValue } from './render-utils';
import {
    Sparkles, CheckCircle2, AlertTriangle, Target,
    ListChecks, Lightbulb, Film, TrendingUp, Search
} from 'lucide-react';

interface SmartOutputProps {
    data: any;
    compact?: boolean;
}

const cardStyle = (compact: boolean) => ({
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: 16,
    padding: compact ? 14 : 18,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: compact ? 8 : 10
});

const pill = (text: string) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        background: 'var(--bg-primary)'
    }}>{text}</span>
);

const renderList = (items: any[], color: string, fallback: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length > 0 ? items.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ marginTop: 4 }}><CheckCircle2 size={14} color={color} /></div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{typeof rec === 'string' ? rec : rec?.summary || formatStructuredValue(rec)}</span>
            </div>
        )) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{fallback}</p>
        )}
    </div>
);

const normalizeScore = (s: any) => {
    if (s === undefined || s === null || isNaN(Number(s))) return undefined;
    const num = Number(s);
    return num <= 1 ? num * 100 : num;
};

export function SmartOutput({ data, compact = false }: SmartOutputProps) {
    if (!data || typeof data !== 'object') return null;

    const sections = data.sections || [];
    const variations = data.variations || data.concepts || [];
    const scenes = data.scenes || [];
    const recommendations = data.recommendations || [];
    const technical = data.technical_fixes || data.tech_fixes || [];
    const actionItems = data.action_items || data.steps || [];
    const keywords = data.keyword_opportunities || data.suggested_keywords || data.keywords || [];
    const score = normalizeScore(data.score);

    const hasContent = [
        score, sections.length, variations.length, scenes.length,
        recommendations.length, technical.length, actionItems.length, keywords.length
    ].some(Boolean);
    if (!hasContent) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {score !== undefined && (
                <div style={cardStyle(compact)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TrendingUp size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Score</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: compact ? 46 : 56, height: compact ? 46 : 56,
                            borderRadius: 12, background: 'var(--bg-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid var(--border-default)'
                        }}>
                            <span style={{ fontSize: compact ? 16 : 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                                {Number.isInteger(score) ? score : score?.toFixed(1)}
                            </span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Overall quality / potential</p>
                            {data.search_intent && <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Intent: {data.search_intent}</p>}
                        </div>
                    </div>
                </div>
            )}

            {keywords.length > 0 && (
                <div style={cardStyle(compact)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Search size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Keyword Opportunities</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {keywords.slice(0, compact ? 10 : keywords.length).map((kw: any, i: number) => {
                            if (typeof kw === 'string') return pill(kw);
                            const label = kw.keyword || kw.label || kw.term || 'Keyword';
                            const meta = [kw.intent, kw.difficulty && `KD ${kw.difficulty}`, kw.volume && `${kw.volume} searches`]
                                .filter(Boolean).join(' • ');
                            return (
                                <div key={i} style={{
                                    padding: '8px 10px',
                                    borderRadius: 12,
                                    border: '1px solid var(--border-default)',
                                    background: 'var(--bg-primary)',
                                    display: 'flex', flexDirection: 'column',
                                    minWidth: 140, gap: 4
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                                    {meta && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {variations.length > 0 && (
                <div style={{ ...cardStyle(compact), gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Variations</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {variations.slice(0, compact ? 3 : variations.length).map((v: any, i: number) => (
                            <div key={i} style={{
                                padding: 12,
                                border: '1px solid var(--border-default)',
                                borderRadius: 12,
                                background: 'var(--bg-primary)',
                                display: 'flex', flexDirection: 'column', gap: 6
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                    Variation {i + 1}
                                </span>
                                {v.headline && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{v.headline}</span>}
                                {v.body && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{v.body}</span>}
                                {v.cta && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>CTA: {v.cta}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sections.length > 0 && (
                <div style={{ ...cardStyle(compact), gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Lightbulb size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Sections</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sections.slice(0, compact ? 4 : sections.length).map((s: any, i: number) => (
                            <div key={i} style={{
                                border: '1px solid var(--border-default)',
                                borderRadius: 10,
                                padding: 10,
                                background: 'var(--bg-primary)',
                                display: 'flex', flexDirection: 'column', gap: 4
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.heading || `Section ${i + 1}`}</span>
                                {s.content && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.content}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {scenes.length > 0 && (
                <div style={cardStyle(compact)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Film size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Scenes / Steps</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {scenes.slice(0, compact ? 4 : scenes.length).map((scene: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: 8,
                                    background: 'rgba(124,92,255,0.12)',
                                    border: '1px solid rgba(124,92,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 800, color: 'var(--primary)'
                                }}>{scene.scene_number || i + 1}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{scene.title || scene.visual_description || `Scene ${i + 1}`}</span>
                                    {scene.visual_description && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scene.visual_description}</span>}
                                    {scene.audio_voiceover && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Audio: {scene.audio_voiceover}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(recommendations.length > 0 || technical.length > 0 || actionItems.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {recommendations.length > 0 && (
                        <div style={cardStyle(compact)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e' }}>
                                <CheckCircle2 size={16} />
                                <span style={{ fontWeight: 700, fontSize: 13 }}>Recommendations</span>
                            </div>
                            {renderList(recommendations, '#22c55e', 'None')}
                        </div>
                    )}
                    {technical.length > 0 && (
                        <div style={cardStyle(compact)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b' }}>
                                <AlertTriangle size={16} />
                                <span style={{ fontWeight: 700, fontSize: 13 }}>Technical Fixes</span>
                            </div>
                            {renderList(technical, '#f59e0b', 'None')}
                        </div>
                    )}
                    {actionItems.length > 0 && (
                        <div style={cardStyle(compact)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
                                <ListChecks size={16} />
                                <span style={{ fontWeight: 700, fontSize: 13 }}>Action Items</span>
                            </div>
                            {renderList(actionItems, 'var(--primary)', 'None')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

