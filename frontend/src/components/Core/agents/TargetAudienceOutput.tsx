import React from 'react';
import { Users, MapPin, Briefcase, Heart, MessageCircle, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { formatStructuredValue } from './render-utils';

interface Persona {
    name: string;
    age_range?: string;
    occupation?: string;
    income_range?: string;
    pain_points?: string[];
    aspirations?: string[];
    preferred_channels?: string[];
    content_preferences?: string[];
    buying_triggers?: string[];
}

interface TargetAudienceOutputProps {
    data: {
        personas?: Persona[];
        primary_persona?: string;
        channel_recommendations?: string[];
        context_updates?: any;
    };
    compact?: boolean;
    showContext?: boolean;
}

const pill = (text: any) => (
    <span style={{
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        background: 'var(--bg-primary)'
    }}>
        {typeof text === 'string' ? text : (typeof text === 'object' ? (text.name || formatStructuredValue(text)) : String(text))}
    </span>
);

export const TargetAudienceOutput: React.FC<TargetAudienceOutputProps> = ({ data, compact = false, showContext = false }) => {
    const personas = data?.personas || [];
    if (!personas.length) return null;

    const renderList = (title: string, items?: any[], icon?: React.ReactNode) => {
        if (!items || items.length === 0) return null;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                    {icon}
                    <span>{title}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {items.slice(0, compact ? 6 : items.length).map((i, idx) => pill(i))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {/* Saved to context */}
            {showContext && data.context_updates?.target_audience && (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    border: '1px solid rgba(34,197,94,0.25)',
                    background: 'rgba(34,197,94,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <Sparkles size={16} color="#22c55e" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Saved to Brand Context</span>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            {typeof data.context_updates.target_audience === 'string' 
                                ? data.context_updates.target_audience 
                                : (data.context_updates.target_audience.name || formatStructuredValue(data.context_updates.target_audience))}
                        </span>
                    </div>
                </div>
            )}

            {/* Personas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: compact ? 10 : 14
            }}>
                {personas.map((p, i) => (
                    <div key={i} style={{
                        border: '1px solid var(--border-default)',
                        borderRadius: 14,
                        padding: compact ? 12 : 16,
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} color="var(--accent-1)" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {p.name}
                                    {data.primary_persona === p.name && (
                                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--accent-1)', fontWeight: 700 }}>(Primary)</span>
                                    )}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {[p.age_range, p.occupation, p.income_range].filter(Boolean).join(' • ')}
                                </span>
                            </div>
                        </div>

                        {renderList('Pain Points', p.pain_points, <Heart size={14} />)}
                        {renderList('Aspirations', p.aspirations, <TrendingUp size={14} />)}
                        {renderList('Preferred Channels', p.preferred_channels, <MessageCircle size={14} />)}
                        {renderList('Content Preferences', p.content_preferences, <Briefcase size={14} />)}
                        {renderList('Buying Triggers', p.buying_triggers, <ShoppingBag size={14} />)}
                    </div>
                ))}
            </div>

            {/* Channel recommendations */}
            {data.channel_recommendations?.length ? (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} color="var(--primary)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                            Channel Recommendations
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.channel_recommendations.map((c: string, i: number) => pill(c))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

