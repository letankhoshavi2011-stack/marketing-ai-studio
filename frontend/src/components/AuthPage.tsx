/** Auth page — login & register with premium dark UI. */

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { useAppStore } from '../store/appStore';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const { setAuth, setShowAuthPage } = useAppStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let res;
            if (mode === 'register') {
                res = await authApi.register(email, password, fullName);
            } else {
                res = await authApi.login(email, password);
            }
            localStorage.setItem('token', res.access_token);
            localStorage.setItem('refresh_token', res.refresh_token);
            const me = await authApi.me();
            setAuth(me);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(124,92,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(192,92,255,0.06) 0%, transparent 50%), var(--bg-primary)',
        }}>
            <button
                onClick={() => setShowAuthPage(false)}
                style={{
                    position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500
                }}
            >
                <ArrowLeft size={16} /> Back to Home
            </button>

            <div className="animate-fade-in" style={{
                width: 440, padding: 40, borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Marketing<span className="gradient-text">AI</span> Studio
                        </h1>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>70 + AI Agents • One Platform</p>
                    </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, marginTop: 16 }}>
                    {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {mode === 'register' && (
                        <input
                            className="input"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        className="input"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            className="input"
                            type={showPw ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            style={{ paddingRight: 44 }}
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                        }}>
                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p style={{
                            color: '#ff5a5a', fontSize: 13, padding: '8px 12px',
                            background: 'rgba(255,90,90,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,90,90,0.2)'
                        }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        opacity: loading ? 0.7 : 1, height: 44,
                    }}>
                        {loading ? (
                            <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}
