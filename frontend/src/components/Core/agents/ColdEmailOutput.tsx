import { Mail, Reply, ListChecks, Sparkles, FileText, Clock3, Layout, Target, ArrowRight, Lightbulb, Tag, CornerDownRight } from 'lucide-react';
import { marked } from 'marked';
import { formatStructuredValue } from './render-utils';

type Email = {
    subject?: string;
    opening_line?: string;
    body?: string;
    cta?: string;
    ps_line?: string;
    step?: string | number;
    send_day?: string | number;
    personalization_tips?: string[];
};

interface ColdEmailOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
        emails?: Email[];
    };
    compact?: boolean;
}

const badge = (text: React.ReactNode, tone: 'primary' | 'accent' | 'muted' | 'success' = 'primary') => {
    let colors = { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' };
    if (tone === 'accent') colors = { bg: 'rgba(124,92,255,0.12)', border: 'rgba(124,92,255,0.25)', text: '#7c5cff' };
    if (tone === 'muted') colors = { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: 'var(--text-secondary)' };
    if (tone === 'success') colors = { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' };

    return (
        <span style={{
            padding: '5px 12px',
            borderRadius: 999,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            fontSize: 10,
            color: colors.text,
            fontWeight: 900,
            letterSpacing: '0.08em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textTransform: 'uppercase',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)'
        }}>
            {text}
        </span>
    );
};

export const ColdEmailOutput: React.FC<ColdEmailOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const { title, sections = [], recommendations = [], action_items = [], emails = [] } = data;

    const renderEmailCard = (email: Email, idx: number) => {
        const isLast = idx === emails.length - 1;
        const dayText = email.send_day !== undefined ? `Day ${email.send_day}` : '';

        // Compact (canvas) style: flat cards, no timeline chrome
        if (compact) {
            return (
                <div key={idx} style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            {badge(`Step ${email.step || idx + 1}`, 'accent')}
                            {dayText && badge(dayText, 'muted')}
                        </div>
                        {email.subject && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>{email.subject}</span>}
                    </div>
                    {email.opening_line && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Opener:</span> {email.opening_line}
                        </div>
                    )}
                    {email.body && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(email.body, { breaks: true }) as string }} />
                        </div>
                    )}
                    {email.cta && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                            <CornerDownRight size={14} color="var(--primary)" /> {email.cta}
                        </div>
                    )}
                    {email.personalization_tips && email.personalization_tips.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Personalize</span>
                            {email.personalization_tips.map((tip, i) => (
                                <div key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                                    <span style={{ color: 'var(--accent-1)' }}>•</span>
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {email.ps_line && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            P.S. {email.ps_line}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div key={idx} style={{
                position: 'relative',
                display: 'flex',
                gap: 24,
                paddingBottom: isLast ? 0 : (compact ? 32 : 56)
            }}>
                {/* Timeline Track & Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24, flexShrink: 0 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '2.5px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        fontSize: 15,
                        fontWeight: 950,
                        zIndex: 2,
                        boxShadow: '0 0 20px rgba(124,92,255,0.35)',
                        marginTop: 4,
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        cursor: 'default'
                    }}>
                        {email.step || idx + 1}
                    </div>
                    {!isLast && (
                        <div style={{
                            width: 3,
                            flex: 1,
                            background: 'linear-gradient(180deg, var(--primary) 0%, rgba(124,92,255,0.05) 100%)',
                            marginTop: 6,
                            marginBottom: -6,
                            opacity: 0.5
                        }} />
                    )}
                </div>

                {/* Email Content Card */}
                <div 
                    className="premium-card-hover"
                    style={{
                        flex: 1,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 28,
                        padding: compact ? 20 : 32,
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                        backdropFilter: 'blur(35px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Subtle Internal Glow */}
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        zIndex: 0 
                    }} />

                    {/* Header */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ 
                                    padding: '5px 10px', 
                                    borderRadius: 8, 
                                    background: 'rgba(124,92,255,0.15)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: 'inset 0 0 10px rgba(124,92,255,0.1)'
                                }}>
                                    <Mail size={16} color="var(--primary)" />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                    Prospect Message {email.step || idx + 1}
                                </span>
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 950, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                {email.subject || "No subject provided"}
                            </h3>
                        </div>
                        {dayText && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                {badge(<><Clock3 size={12}/> {dayText}</>, 'accent')}
                            </div>
                        )}
                    </div>

                    {/* Email body stylized like a real UI */}
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ 
                            padding: '10px 20px', 
                            background: 'rgba(255,255,255,0.03)', 
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f56', boxShadow: '0 0 8px rgba(255,95,86,0.3)' }} />
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 8px rgba(255,189,46,0.3)' }} />
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#27c93f', boxShadow: '0 0 8px rgba(39,201,63,0.3)' }} />
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Message Composer</span>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {email.opening_line && (
                                <div style={{ 
                                    padding: '12px 18px', 
                                    background: 'rgba(124,92,255,0.08)', 
                                    borderRadius: 12, 
                                    borderLeft: '4px solid var(--primary)',
                                    marginBottom: 4
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Power Opener</span>
                                    <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 700, margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                                        "{email.opening_line}"
                                    </p>
                                </div>
                            )}
                            {email.body && (
                                <div
                                    style={{ 
                                        fontSize: 15, 
                                        color: '#f8fafc', 
                                        lineHeight: 1.8,
                                        fontFamily: 'Inter, -apple-system, system-ui, sans-serif'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: marked.parse(email.body, { breaks: true }) as string }}
                                />
                            )}
                            {email.ps_line && (
                                <div style={{ 
                                    marginTop: 8,
                                    paddingTop: 16,
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    gap: 10
                                }}>
                                    <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 950, flexShrink: 0 }}>P.S.</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>{email.ps_line}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA and Personalization */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {email.cta && (
                            <div style={{ 
                                flex: 1,
                                minWidth: 220,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 12, 
                                padding: '16px 20px',
                                background: 'linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(124,92,255,0.1) 100%)',
                                borderRadius: 18,
                                border: '1px solid rgba(124,92,255,0.35)',
                                boxShadow: '0 8px 24px rgba(124,92,255,0.1)'
                            }}>
                                <CornerDownRight size={18} color="var(--primary)" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call to Action</span>
                                    <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{email.cta}</span>
                                </div>
                            </div>
                        )}
                        {email.personalization_tips && email.personalization_tips.length > 0 && (
                            <div style={{ 
                                flex: 1.8,
                                minWidth: 280,
                                display: 'flex', 
                                gap: 14, 
                                padding: '16px 20px',
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: 18,
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                <Target size={18} color="var(--accent-1)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>High-Impact Personalization</span>
                                        {badge('Exclusive', 'success')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {email.personalization_tips.map((tip, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-1)', marginTop: 7, flexShrink: 0, boxShadow: '0 0 5px var(--accent-1)' }} />
                                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 32 }}>
            {/* Header */}
            {title && (
                <div style={{
                    padding: compact ? 14 : 28,
                    borderRadius: 18,
                    background: compact ? 'var(--bg-secondary)' : 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(34,197,94,0.10))',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}>
                    <style>{`
                        .premium-card-hover:hover { transform: translateY(-4px); }
                    `}</style>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: compact ? 36 : 46,
                            height: compact ? 36 : 46,
                            borderRadius: 12,
                            background: 'var(--accent-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Mail size={compact ? 16 : 20} color="#fff" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cold Email Plan</span>
                            <span style={{ fontSize: compact ? 16 : 20, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</span>
                        </div>
                    </div>
                    {emails.length > 0 && <div>{badge(`${emails.length} Steps`, 'accent')}</div>}
                </div>
            )}

            {/* Premium Strategic Layers */}
            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    {sections
                        .filter(s => {
                            const h = (s.heading || '').toLowerCase();
                            return !h.includes('email') && h !== 'sequence' && h !== 'sequence overview';
                        })
                        .map((s, i) => (
                        <div key={i} className="premium-card-hover" style={{
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 24,
                            padding: 28,
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 36, 
                                    height: 36, 
                                    borderRadius: 10, 
                                    background: i % 2 === 0 ? 'rgba(124,92,255,0.1)' : 'rgba(34,197,94,0.1)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                }}>
                                    {i % 2 === 0 ? <Layout size={20} color="var(--primary)" /> : <Target size={20} color="#22c55e" />}
                                </div>
                                <span style={{ fontSize: 17, fontWeight: 950, color: 'var(--text-primary)', textTransform: 'capitalize', letterSpacing: '-0.02em' }}>
                                    {s.heading || `Strategic Layer ${i + 1}`}
                                </span>
                            </div>
                            {s.content && (
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, opacity: 0.9 }}>
                                    {formatStructuredValue(s.content)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Outreach Roadmap */}
            {emails.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                        <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Campaign Roadmap & Drafts
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {emails.map(renderEmailCard)}
                    </div>
                </div>
            )}

            {/* Ultra-Premium Recommendations & Actions */}
            {(recommendations.length > 0 || action_items.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginTop: 12 }}>
                    {recommendations.length > 0 && (
                        <div 
                            className="premium-card-hover"
                            style={{
                                border: '1px solid rgba(124,92,255,0.3)',
                                borderRadius: 32,
                                padding: 32,
                                background: 'linear-gradient(135deg, rgba(124,92,255,0.1) 0%, rgba(124,92,255,0.03) 100%)',
                                backdropFilter: 'blur(30px)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 12, 
                                    background: 'rgba(124,92,255,0.15)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(124,92,255,0.1)'
                                }}>
                                    <Lightbulb size={22} color="var(--primary)" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Advice</span>
                                    <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Optimization Logic</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {recommendations.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            marginTop: 7, 
                                            width: 8, 
                                            height: 8, 
                                            borderRadius: '2px', 
                                            background: 'var(--primary)', 
                                            flexShrink: 0, 
                                            transform: 'rotate(45deg)',
                                            boxShadow: '0 0 8px var(--primary)'
                                        }} />
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {action_items.length > 0 && (
                        <div 
                            className="premium-card-hover"
                            style={{
                                border: '1px solid rgba(34,197,94,0.3)',
                                borderRadius: 32,
                                padding: 32,
                                background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)',
                                backdropFilter: 'blur(30px)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 12, 
                                    background: 'rgba(34,197,94,0.15)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(34,197,94,0.1)'
                                }}>
                                    <Tag size={22} color="var(--accent-1)" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent-1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Execution Plan</span>
                                    <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Outreach Checklist</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {action_items.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                                            color: 'white', 
                                            padding: '2px 10px', 
                                            borderRadius: 8, 
                                            fontSize: 11, 
                                            fontWeight: 950, 
                                            flexShrink: 0,
                                            boxShadow: '0 4px 10px rgba(34,197,94,0.3)'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>{r}</span>
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
