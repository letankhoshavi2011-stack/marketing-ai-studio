import React from 'react';
import { Rocket, Calendar, Target, Zap, Share2, CheckCircle, Clock, Flag, Layout, Users, Megaphone, TrendingUp, AlertTriangle } from 'lucide-react';

interface Section {
    heading?: string;
    content?: string;
}

interface LaunchStrategyOutputProps {
    data: {
        title?: string;
        launch_type?: string;
        sections?: Section[];
        recommendations?: string[];
        action_items?: string[];
    };
    compact?: boolean;
}

const pill = (text: string) => (
    <span style={{
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-primary)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-secondary)'
    }}>{text}</span>
);

export const LaunchStrategyOutput: React.FC<LaunchStrategyOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    const sections = data.sections || [];
    const recs = data.recommendations || [];
    const actions = data.action_items || [];
    
    // Find special sections
    const preLaunch = sections.find(s => s.heading?.toLowerCase().includes('pre-launch') || s.heading?.toLowerCase().includes('preparation'));
    const launchWeek = sections.find(s => s.heading?.toLowerCase().includes('launch week') || s.heading?.toLowerCase().includes('launch day'));
    const postLaunch = sections.find(s => s.heading?.toLowerCase().includes('post-launch') || s.heading?.toLowerCase().includes('optimization'));
    
    const otherSections = sections.filter(s => s !== preLaunch && s !== launchWeek && s !== postLaunch);

    const getIconForSection = (heading: string) => {
        const h = heading.toLowerCase();
        if (h.includes('messaging') || h.includes('positioning')) return <Megaphone size={14} color="#7c5cff" />;
        if (h.includes('channel')) return <Share2 size={14} color="#22c55e" />;
        if (h.includes('influencer') || h.includes('partnership')) return <Users size={14} color="#eab308" />;
        if (h.includes('metric') || h.includes('kpi')) return <TrendingUp size={14} color="#3b82f6" />;
        if (h.includes('risk') || h.includes('mitigation')) return <AlertTriangle size={14} color="#ef4444" />;
        return <Layout size={14} color="var(--accent-1)" />;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 24, paddingBottom: 20 }}>
            {/* 🚀 HEADER CARD */}
            <div style={{
                padding: compact ? 16 : 24,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(124,92,255,0.15), rgba(34,197,94,0.10))',
                border: '1px solid rgba(124,92,255,0.25)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <Rocket size={120} color="var(--primary)" />
                </div>
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(124,92,255,0.3)'
                        }}>
                            <Rocket size={20} color="white" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Strategy Engine</span>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{data.title || 'Launch Strategy'}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                        {data.launch_type && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: 8, 
                                padding: '6px 12px', borderRadius: 10, 
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' 
                            }}>
                                <Zap size={14} color="#eab308" />
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Type: <strong>{data.launch_type}</strong></span>
                            </div>
                        )}
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 8, 
                            padding: '6px 12px', borderRadius: 10, 
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' 
                        }}>
                            <Calendar size={14} color="#22c55e" />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duration: <strong>8-12 Weeks</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🗺️ ROADMAP TIMELINE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Flag size={16} color="var(--primary)" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Launch Roadmap</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                    {/* Vertical line for the roadmap */}
                    <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, background: 'linear-gradient(to bottom, var(--primary), var(--accent-1), var(--border-default))', opacity: 0.3 }} />

                    {/* Pre-Launch Phase */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', 
                            border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, flexShrink: 0, boxShadow: '0 0 15px rgba(124,92,255,0.2)'
                        }}>
                            <Clock size={18} color="var(--primary)" />
                        </div>
                        <div style={{ 
                            flex: 1, padding: 16, borderRadius: 16, border: '1px solid var(--border-default)', 
                            background: 'var(--bg-secondary)', transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{preLaunch?.heading || 'Pre-Launch Phase'}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'rgba(124,92,255,0.1)', padding: '2px 8px', borderRadius: 6 }}>4-6 WEEKS OUT</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {preLaunch?.content || 'Building anticipation, teaser campaigns, and waitlist management.'}
                            </p>
                        </div>
                    </div>

                    {/* Launch Week Phase */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', 
                            border: '2px solid var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, flexShrink: 0, boxShadow: '0 0 15px rgba(34,197,94,0.2)'
                        }}>
                            <Zap size={18} color="var(--accent-1)" />
                        </div>
                        <div style={{ 
                            flex: 1, padding: 16, borderRadius: 16, border: '1px solid rgba(34,197,94,0.3)', 
                            background: 'rgba(34,197,94,0.03)', transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{launchWeek?.heading || 'Launch Week'}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-1)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 6 }}>GO-LIVE</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {launchWeek?.content || 'Tactical day-by-day execution across all priority channels.'}
                            </p>
                        </div>
                    </div>

                    {/* Post-Launch Phase */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', 
                            border: '2px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, flexShrink: 0
                        }}>
                            <TrendingUp size={18} color="var(--text-muted)" />
                        </div>
                        <div style={{ 
                            flex: 1, padding: 16, borderRadius: 16, border: '1px solid var(--border-default)', 
                            background: 'var(--bg-secondary)', opacity: 0.9
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{postLaunch?.heading || 'Post-Launch Phase'}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6 }}>OPTIMIZATION</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {postLaunch?.content || 'Monitoring KPIs, gathering feedback, and iterative improvements.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🏗️ CORE STRATEGY SECTIONS */}
            {otherSections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {otherSections.map((s, i) => (
                        <div key={i} style={{
                            padding: 16, borderRadius: 16, border: '1px solid var(--border-default)',
                            background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {getIconForSection(s.heading || '')}
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{s.heading}</span>
                            </div>
                            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {s.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 💡 NEXT STEPS & RECOMMENDATIONS */}
            {(recs.length > 0 || actions.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {recs.length > 0 && (
                        <div style={{
                            padding: 16, borderRadius: 16, border: '1px solid var(--border-default)',
                            background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Zap size={16} color="#eab308" />
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Strategic Advice</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recs.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ marginTop: 6, width: 5, height: 5, borderRadius: '50%', background: '#eab308', flexShrink: 0 }} />
                                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {actions.length > 0 && (
                        <div style={{
                            padding: 16, borderRadius: 16, border: '1px solid var(--border-default)',
                            background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <CheckCircle size={16} color="#22c55e" />
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Launch Checklist</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {actions.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        {pill(`Step ${i + 1}`)}
                                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
