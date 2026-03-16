import { Mail, Clock3, ListChecks, Sparkles, FileText, ArrowRight, CornerDownRight, Tag, Lightbulb, Layout, Target } from 'lucide-react';
import { marked } from 'marked';
import { formatStructuredValue } from './render-utils';

type EmailStep = {
    subject?: string;
    body?: string;
    cta?: string;
    goal?: string;
    step?: string | number;
    day_offset?: string | number;
    timing?: string;
};

interface EmailSequenceOutputProps {
    data: {
        title?: string;
        sections?: { heading?: string; content?: string }[];
        recommendations?: string[];
        action_items?: string[];
        emails?: EmailStep[];
        text_content?: string;
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
            padding: '4px 10px',
            borderRadius: 999,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            fontSize: 10,
            color: colors.text,
            fontWeight: 800,
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            textTransform: 'uppercase'
        }}>
            {text}
        </span>
    );
};

const EmailSequenceOutput: React.FC<EmailSequenceOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    const emails = data.emails || [];
    const sections = data.sections || [];
    const recs = data.recommendations || [];
    const actions = data.action_items || [];
    const textContent = data.text_content;

    const hasContent = emails.length > 0 || sections.length > 0 || recs.length > 0 || actions.length > 0;
    const maxDay = emails.reduce<number>((acc, e) => {
        const d = typeof e.day_offset === 'string' ? parseFloat(e.day_offset) : e.day_offset;
        return d && d > acc ? d : acc;
    }, 0);
    const steps = emails.length || 0;

    const renderEmail = (email: EmailStep, idx: number) => {
        const isLast = idx === emails.length - 1;
        const dayText = email.day_offset !== undefined ? `Day ${email.day_offset}` : (email.timing || '');
        
        return (
            <div key={idx} style={{
                position: 'relative',
                display: 'flex',
                gap: 20,
                paddingBottom: isLast ? 0 : (compact ? 24 : 40)
            }}>
                {/* Timeline Track & Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24, flexShrink: 0 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '2px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: 900,
                        zIndex: 2,
                        boxShadow: '0 0 15px rgba(124,92,255,0.25)',
                        position: 'relative',
                        marginTop: 4
                    }}>
                        {email.step || idx + 1}
                    </div>
                    {!isLast && (
                        <div style={{
                            width: 2,
                            flex: 1,
                            background: 'linear-gradient(180deg, var(--primary) 0%, rgba(124,92,255,0.1) 100%)',
                            marginTop: 4,
                            marginBottom: -4,
                            opacity: 0.4
                        }} />
                    )}
                </div>

                {/* Email Content Card */}
                <div style={{
                    flex: 1,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    padding: compact ? 16 : 24,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    transition: 'all 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: 6, 
                                    background: 'rgba(124,92,255,0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <Mail size={14} color="var(--primary)" />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Email Segment {email.step || idx + 1}
                                </span>
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                                {email.subject || "No subject provided"}
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                            {dayText && badge(<><Clock3 size={12}/> {dayText}</>, 'accent')}
                        </div>
                    </div>

                    {/* Email body stylized like a real UI */}
                    {email.body && (
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16,
                            overflow: 'hidden'
                        }}>
                             {/* Mock Email Header */}
                             <div style={{ 
                                padding: '8px 16px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                             }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                                <div style={{ flex: 1 }} />
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Draft Preview</span>
                             </div>

                            <div
                                style={{ 
                                    padding: 20,
                                    fontSize: 14, 
                                    color: '#e2e8f0', 
                                    lineHeight: 1.7,
                                    fontFamily: 'Inter, -apple-system, system-ui, sans-serif'
                                }}
                                dangerouslySetInnerHTML={{ __html: marked.parse(email.body, { breaks: true }) as string }}
                            />
                        </div>
                    )}

                    {/* Features/Goals and CTA */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                        {email.goal && (
                             <div style={{ 
                                flex: 1,
                                minWidth: 200,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10, 
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 14,
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <Target size={16} color="var(--accent-1)" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conversion Goal</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{email.goal}</span>
                                </div>
                            </div>
                        )}
                        {email.cta && (
                            <div style={{ 
                                flex: 1,
                                minWidth: 200,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10, 
                                padding: '12px 16px',
                                background: 'linear-gradient(to right, rgba(124,92,255,0.15), rgba(124,92,255,0.08))',
                                borderRadius: 14,
                                border: '1px solid rgba(124,92,255,0.25)'
                            }}>
                                <ArrowRight size={16} color="var(--primary)" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Primary Call to Action</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{email.cta}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 20 : 32 }}>
            {data.title && (
                <div style={{
                    padding: compact ? 20 : 32,
                    borderRadius: 24,
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.1) 0%, rgba(34,197,94,0.05) 100%)',
                    border: '1px solid rgba(124,92,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        top: -50, 
                        right: -50, 
                        width: 200, 
                        height: 200, 
                        background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)',
                        zIndex: 0
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ 
                                width: 42, 
                                height: 42, 
                                borderRadius: 12, 
                                background: 'var(--primary)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(124,92,255,0.25)'
                            }}>
                                <Mail size={22} color="white" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                    Campaign Engine
                                </span>
                                <h1 style={{ fontSize: 24, fontWeight: 950, color: 'var(--text-primary)', margin: 0 }}>
                                    {data.title}
                                </h1>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                             {steps > 0 && badge(<><Mail size={12}/> {steps} Step Sequence</>, 'accent')}
                             {maxDay > 0 && badge(<><Clock3 size={12}/> ~{maxDay} Days Duration</>, 'muted')}
                             <div style={{ flex: 1 }} />
                             <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>STRATEGY: <strong>LIFECYCLE</strong></span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-sections (Overview, Goals, etc.) */}
            {sections.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {sections
                        .filter(s => {
                            const h = (s.heading || '').toLowerCase();
                            // Filter out redundant "Emails" or "Sequence" sections which are already in the timeline
                            return !h.includes('email') && h !== 'sequence' && h !== 'sequence overview';
                        })
                        .map((s, i) => (
                        <div key={i} style={{
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 20,
                            padding: 24,
                            background: 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {i === 0 ? <Layout size={18} color="var(--primary)" /> : <Sparkles size={18} color="var(--accent-1)" />}
                                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                    {s.heading || `Strategic Layer ${i + 1}`}
                                </span>
                            </div>
                            {s.content && (
                                <p style={{ 
                                    fontSize: 13.5, 
                                    color: 'var(--text-secondary)', 
                                    lineHeight: 1.6,
                                    margin: 0 
                                }}>
                                    {formatStructuredValue(s.content)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* The Actual Vertical Timeline of Emails */}
            {emails.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginTop: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, marginBottom: 8 }}>
                        <ListChecks size={18} color="var(--primary)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Campaign Roadmap & Drafts
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: compact ? '0 4px' : '0 8px'
                    }}>
                        {emails.map(renderEmail)}
                    </div>
                </div>
            )}

            {/* Strategic Recommendations & Actions */}
            {(recs.length > 0 || actions.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 12 }}>
                    {recs.length > 0 && (
                        <div style={{
                            border: '1px solid rgba(124,92,255,0.25)',
                            borderRadius: 24,
                            padding: 24,
                            background: 'linear-gradient(135deg, rgba(124,92,255,0.08) 0%, rgba(124,92,255,0.02) 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lightbulb size={18} color="var(--primary)" />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Optimization Advice</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recs.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ marginTop: 8, width: 6, height: 6, borderRadius: '2px', background: 'var(--primary)', flexShrink: 0, transform: 'rotate(45deg)' }} />
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {actions.length > 0 && (
                        <div style={{
                            border: '1px solid rgba(34,197,94,0.25)',
                            borderRadius: 24,
                            padding: 24,
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={18} color="var(--accent-1)" />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Launch Checklist</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {actions.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            background: 'rgba(34,197,94,0.2)', 
                                            color: '#22c55e', 
                                            padding: '2px 8px', 
                                            borderRadius: 8, 
                                            fontSize: 10, 
                                            fontWeight: 900, 
                                            flexShrink: 0 
                                        }}>
                                            {i + 1}
                                        </div>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!hasContent && (
                <div style={{ padding: 14, borderRadius: 12, border: '1px dashed var(--border-default)', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                    No email sequence data available yet.
                </div>
            )}
        </div>
    );
};

export default EmailSequenceOutput;

