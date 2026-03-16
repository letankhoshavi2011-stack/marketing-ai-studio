import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Bot, Target, Palette, Zap, CheckCircle, Image as ImageIcon, Users } from 'lucide-react';
import { AGENT_CATEGORIES } from '../data/agents';
import { useAppStore } from '../store/appStore';

const TYPING_SPEED = 40;
const DEMO_PROMPT = "Create a launch campaign for 'Lumina', a new luxury cold brew coffee targeting urban professionals. Include a logo, ad copy, and an Instagram video script.";

export default function LandingPage() {
    const { setShowAuthPage } = useAppStore();
    const [typedText, setTypedText] = useState("");
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < DEMO_PROMPT.length) {
                setTypedText(DEMO_PROMPT.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setShowResults(true), 600);
            }
        }, TYPING_SPEED);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden', overflowY: 'auto' }}>
            {/* Header */}
            <header className="mobile-padding" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-default)',
                background: 'rgba(25, 27, 31, 0.8)', backdropFilter: 'blur(20px)',
                position: 'sticky', top: 0, zIndex: 100, height: 72
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <div className="hide-on-mobile">
                        <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
                            MarketingAI <span className="gradient-text">Studio</span>
                        </h1>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn-ghost" onClick={() => setShowAuthPage(true)}>Sign In</button>
                    <button className="btn-primary" onClick={() => setShowAuthPage(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Get Started <ArrowRight size={16} />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes glow {
                    0% { box-shadow: 0 0 5px rgba(124, 92, 255, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(124, 92, 255, 0.4); }
                    100% { box-shadow: 0 0 5px rgba(124, 92, 255, 0.2); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-glow { animation: glow 4s ease-in-out infinite; }
                .gradient-text {
                    background: linear-gradient(90deg, #7c5cff, #ff6b6b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
            <section className="mobile-padding" style={{
                paddingTop: 100, paddingBottom: 100,
                background: 'radial-gradient(circle at 50% 0%, rgba(124, 92, 255, 0.15) 0%, transparent 50%), var(--bg-primary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                    background: 'var(--gradient-subtle)', borderRadius: 100, border: '1px solid rgba(124,92,255,0.2)',
                    marginBottom: 24, animation: 'fadeInDown 0.6s ease-out'
                }}>
                    <Bot size={16} color="var(--accent-1)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-1)', textTransform: 'uppercase', letterSpacing: 1 }}>
                        The Ultimate MarketingAI Studio
                    </span>
                </div>

                <h1
                    className="mobile-title"
                    style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 24, maxWidth: 900, animation: 'fadeInUp 0.8s ease-out' }}
                >
                    Your Complete <span className="gradient-text">AI Marketing</span><br />
                    Powerhouse in One Box.
                </h1>

                <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 650, marginBottom: 48, lineHeight: 1.6, animation: 'fadeInUp 1s ease-out' }}>
                    From brand identity and logo design to cinematic video generation and SEO optimization.
                    Deploy 70+ specialized AI agents meticulously trained for digital marketing excellence.
                </p>

                {/* Interactive Demo Terminal */}
                <div
                    className="animate-float"
                    style={{
                        width: '100%', maxWidth: 860, background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.4)', overflow: 'hidden', textAlign: 'left',
                        animation: 'fadeInUp 1.2s ease-out'
                    }}>
                    {/* Mac window controls */}
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
                        display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                    </div>

                    <div style={{ padding: 32 }}>
                        {/* Prompt Input */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Users size={18} color="var(--accent-1)" />
                            </div>
                            <div style={{
                                flex: 1, padding: '16px 20px', background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
                                fontSize: 16, lineHeight: 1.5, color: '#fff', position: 'relative'
                            }}>
                                {typedText}
                                {!showResults && <span className="animate-pulse" style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--accent-1)', marginLeft: 4, verticalAlign: 'middle' }} />}
                            </div>
                        </div>

                        {/* Simulated Agent Output */}
                        {showResults && (
                            <div className="animate-fade-in" style={{ display: 'flex', gap: 16 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Sparkles size={18} color="white" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', background: 'rgba(254, 202, 87, 0.1)', color: '#feca57', borderRadius: 100, border: '1px solid rgba(254, 202, 87, 0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Target size={12} /> Campaign Concept
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', borderRadius: 100, border: '1px solid rgba(255, 107, 107, 0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Palette size={12} /> Logo Designer
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', background: 'rgba(72, 219, 251, 0.1)', color: '#48dbfb', borderRadius: 100, border: '1px solid rgba(72, 219, 251, 0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Zap size={12} /> Ad Copywriter
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <p style={{ fontSize: 15, color: '#e2e8f0', marginBottom: 20 }}>
                                            I've orchestrated the team to launch <strong>Lumina Cold Brew</strong>. Here is the final package:
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            {/* Simulated Image */}
                                            <div style={{
                                                aspectRatio: '1', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative', overflow: 'hidden'
                                            }}>
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #2a2a35, #1a1a24)', opacity: 0.5 }} />
                                                <ImageIcon size={32} color="var(--text-muted)" style={{ zIndex: 1 }} />
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', zIndex: 1 }}>lumina_logo_final.png</span>
                                                <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent-1)', padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600 }}>GENERATED</div>
                                            </div>

                                            {/* Simulated Copy */}
                                            <div style={{
                                                background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-default)', padding: 16
                                            }}>
                                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instagram Ad Copy</h4>
                                                <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.5 }}>
                                                    Pure focus, zero compromise.<br /><br />
                                                    Meet Lumina. Cold-brewed for 18 hours. Designed for the relentless. ☕️✨<br /><br />
                                                    #LuminaColdBrew #UrbanFocus
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Agent Grid Showcase */}
            <section className="mobile-padding" style={{ paddingTop: 80, paddingBottom: 80, background: '#0f1015' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>The Agent Architecture</h2>
                    <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                        Multiple specialized LLM agents communicating through shared blackboards to perfectly execute complex marketing workflows.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
                    {AGENT_CATEGORIES.map((category) => (
                        <div key={category.title}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: category.color, boxShadow: `0 0 10px ${category.color}` }} />
                                {category.title}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: 16
                            }}>
                                {category.agents.map(agent => (
                                    <div key={agent.id} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: 16,
                                        display: 'flex', gap: 12,
                                        transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.borderColor = category.color;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <agent.icon size={16} color={category.color} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#fff' }}>{agent.name}</h4>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{agent.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mobile-padding" style={{ paddingTop: 100, paddingBottom: 100, textAlign: 'center', background: 'var(--bg-primary)' }}>
                <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>Ready to multiply your output?</h2>
                <button className="btn-primary" onClick={() => setShowAuthPage(true)} style={{ fontSize: 16, padding: '14px 32px', height: 'auto', borderRadius: 100 }}>
                    Create Your Free Account
                </button>
            </section>
        </div>
    );
}
