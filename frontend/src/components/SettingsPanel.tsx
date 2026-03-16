import React, { useState, useEffect } from 'react';
import { Settings, Save, LayoutGrid, Megaphone, Loader2, KeyRound } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { workspaceApi, campaignApi } from '../services/api';
import { GeminiLogo, AppLogo } from './Icons';
import PanelHeader from './PanelHeader';

export default function SettingsPanel() {
    const { activeWorkspace, updateActiveWorkspace } = useAppStore();

    // Local state for Workspace form
    const [wsName, setWsName] = useState(activeWorkspace?.name || '');
    const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
    const [wsGeminiKey, setWsGeminiKey] = useState(activeWorkspace?.settings?.gemini_api_key || '');
    const [isSavingWs, setIsSavingWs] = useState(false);


    // Reset local state when active entity changes
    useEffect(() => {
        setWsName(activeWorkspace?.name || '');
        setWsDesc(activeWorkspace?.description || '');
        setWsGeminiKey(activeWorkspace?.settings?.gemini_api_key || '');
    }, [activeWorkspace]);


    const handleSaveWorkspace = async () => {
        if (!activeWorkspace) return;
        setIsSavingWs(true);
        try {
            const data = {
                name: wsName,
                description: wsDesc,
                settings: {
                    gemini_api_key: wsGeminiKey
                }
            };
            await workspaceApi.update(activeWorkspace.uuid, data);
            updateActiveWorkspace(data);
        } catch (error: any) {
            console.error('Failed to update workspace:', error);
            alert(error.message || 'Failed to update workspace');
        } finally {
            setIsSavingWs(false);
        }
    };


    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', overflowY: 'auto' }} className="custom-scrollbar">
            <div className="mobile-padding" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
                <PanelHeader
                    title="Settings"
                    Icon={Settings}
                    subtitle={(
                        <>
                            <span>Workspace preferences</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><KeyRound size={13} color="var(--accent-1)" /> API configurations</span>
                        </>
                    )}
                />
            </div>

            <div className="mobile-padding" style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 0 60px 0' }}>



                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.5s ease-out 0.1s backwards' }}>

                    {/* Workspace Settings */}
                    {activeWorkspace ? (
                        <>
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 32 }}>
                                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <LayoutGrid size={20} color="var(--accent-2)" />
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Workspace Configuration</h2>
                                </div>

                                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Workspace Name</label>
                                        <input
                                            value={wsName}
                                            onChange={e => setWsName(e.target.value)}
                                            placeholder="Workspace Name"
                                            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Workspace Description</label>
                                        <textarea
                                            value={wsDesc}
                                            onChange={e => setWsDesc(e.target.value)}
                                            placeholder="Describe the purpose of this workspace..."
                                            rows={3}
                                            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button
                                            onClick={handleSaveWorkspace}
                                            disabled={isSavingWs}
                                            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '10px 24px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: isSavingWs ? 'not-allowed' : 'pointer', border: 'none', opacity: isSavingWs ? 0.7 : 1 }}
                                        >
                                            {isSavingWs ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {isSavingWs ? 'Saving...' : 'Save Workspace'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* API Keys Configuration Card */}
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <KeyRound size={20} color="var(--accent-1)" />
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Integrations & API Keys</h2>
                                </div>

                                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                        Provide your own API keys to query specific provider models. By default, the system will use your backend's built-in models unless overridden here.
                                    </p>


                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                            <GeminiLogo size={16} /> Google Gemini API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={wsGeminiKey}
                                            onChange={e => setWsGeminiKey(e.target.value)}
                                            placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button
                                            onClick={handleSaveWorkspace}
                                            disabled={isSavingWs}
                                            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '10px 24px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: isSavingWs ? 'not-allowed' : 'pointer', border: 'none', opacity: isSavingWs ? 0.7 : 1 }}
                                        >
                                            {isSavingWs ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {isSavingWs ? 'Saving...' : 'Save Integrations'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: 60, textAlign: 'center', background: 'var(--bg-secondary)',
                            border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                        }}>
                            <AppLogo size={40} className="animate-pulse-glow" />
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No workspace selected.</p>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
