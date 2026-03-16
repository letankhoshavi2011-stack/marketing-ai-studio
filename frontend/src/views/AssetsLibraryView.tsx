import React, { useEffect, useState, useMemo } from 'react';
import {
    Image, Film, Search, Download, Link, ExternalLink,
    Calendar, Clock, Sparkles, Loader2, Play, FolderOpen,
    Maximize2, Minimize2, X, Eye
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { assetsApi } from '../services/api';
import PanelHeader from '../components/PanelHeader';

interface Asset {
    id: string;
    asset_type: 'image' | 'video';
    gcs_url: string;
    thumbnail_url?: string;
    prompt_used: string;
    created_at: string;
    campaign_name: string;
    agent_name: string;
}

export default function AssetsLibraryView() {
    const { activeWorkspace } = useAppStore();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    useEffect(() => {
        if (!activeWorkspace) return;
        setLoading(true);
        assetsApi.list(activeWorkspace.uuid)
            .then(data => setAssets(Array.isArray(data) ? data : []))
            .catch(err => console.error("Failed to load assets", err))
            .finally(() => setLoading(false));
    }, [activeWorkspace?.uuid]);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesSearch = asset.prompt_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                asset.campaign_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterType === 'all' || asset.asset_type === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [assets, searchQuery, filterType]);
    const [fullView, setFullView] = useState(false);
    const [inlinePlay, setInlinePlay] = useState<string | null>(null);

    const handleDownload = async (asset: Asset) => {
        try {
            // Add a timestamp or cache-busting param to avoid cached redirected responses that might miss CORS headers
            const response = await fetch(asset.gcs_url, {
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            
            // Extract filename from URL or generate one
            const filename = `asset-${asset.id.slice(0, 8)}.${asset.asset_type === 'image' ? 'png' : 'mp4'}`;
            link.setAttribute('download', filename);
            
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (err) {
            console.error("Advanced download failed, falling back to simple redirect", err);
            // If CORS fails, we try a direct download via window.open which might open in new tab 
            // but is the only fallback if the browser blocks the fetch.
            const link = document.createElement('a');
            link.href = asset.gcs_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('download', '');
            link.click();
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent-1)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading asset library...</p>
                </div>
            </div>
        );
    }

    const countImages = assets.filter(a => a.asset_type === 'image').length;
    const countVideos = assets.filter(a => a.asset_type === 'video').length;

    return (
        <div className="view-container custom-scrollbar" style={{ padding: '32px', overflowY: 'auto', maxWidth: fullView ? '100%' : 1400, margin: '0 auto' }}>
            {/* Header Area */}
            <PanelHeader
                title="Assets Library"
                Icon={FolderOpen}
                subtitle={
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Image size={14} /> {countImages} images
                        </span>
                        <span style={{ opacity: 0.3 }}>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Film size={14} /> {countVideos} videos
                        </span>
                        <span style={{ opacity: 0.3 }}>•</span>
                        <button
                            onClick={() => setFullView(!fullView)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 6, 
                                background: 'none', border: 'none', color: 'var(--accent-1)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0
                            }}
                            title={fullView ? 'Exit full width' : 'Full width view'}
                        >
                            {fullView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            {fullView ? 'Fit view' : 'Full view'}
                        </button>
                    </>
                }
            />

            {/* Toolbar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        className="input"
                        style={{ paddingLeft: 40, width: '100%' }}
                        placeholder="Search by prompt or campaign..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                        className={filterType === 'all' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilterType('all')}
                        style={{ fontSize: 12, padding: '8px 12px' }}
                    >
                        All
                    </button>
                    <button
                        className={filterType === 'image' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilterType('image')}
                        style={{ fontSize: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Image size={13} /> Images
                    </button>
                    <button
                        className={filterType === 'video' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setFilterType('video')}
                        style={{ fontSize: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Film size={13} /> Videos
                    </button>
                </div>
            </div>

            {/* Grid Area */}
            {filteredAssets.length === 0 ? (
                <div style={{ 
                    padding: '80px 20px', textAlign: 'center', 
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--border-default)'
                }}>
                    <Sparkles size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No assets found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {searchQuery ? "Try adjusting your search query." : "Generated images and videos will appear here."}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: fullView ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: fullView ? 20 : 16
                }}>
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id} 
                            className="asset-card"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-default)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            {/* Preview */}
                            <div 
                                style={{ 
                                    aspectRatio: '16/9', background: '#000', position: 'relative', 
                                    cursor: 'pointer', overflow: 'hidden' 
                                }}
                                onClick={() => setSelectedAsset(asset)}
                            >
                                {asset.asset_type === 'video' ? (
                                    <video
                                        src={asset.gcs_url}
                                        poster={asset.thumbnail_url}
                                        muted
                                        loop
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onMouseEnter={e => { 
                                            e.currentTarget.play().catch(() => {});
                                            setInlinePlay(asset.id);
                                        }}
                                        onMouseLeave={e => { 
                                            e.currentTarget.pause(); 
                                            e.currentTarget.currentTime = 0;
                                            setInlinePlay(null);
                                        }}
                                    >
                                        <div style={{ 
                                            width: '100%', height: '100%', 
                                            background: 'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(56,189,248,0.25))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            color: 'white', fontWeight: 600, letterSpacing: 0.3
                                        }}>
                                            <Film size={24} />
                                            <span>Video</span>
                                        </div>
                                    </video>
                                ) : (
                                    <img 
                                        src={asset.thumbnail_url || asset.gcs_url} 
                                        alt={asset.prompt_used}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }}
                                        className="hover-scale"
                                    />
                                )}
                                <div style={{ 
                                    position: 'absolute', top: 12, right: 12,
                                    padding: '4px 8px', borderRadius: 6,
                                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                    color: 'white', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                    {asset.asset_type === 'image' ? <Image size={10} /> : <Film size={10} />}
                                    {asset.asset_type.toUpperCase()}
                                </div>
                                <div 
                                    className="asset-hover-overlay"
                                    style={{
                                        position: 'absolute', inset: 0, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.3s',
                                        zIndex: 5
                                    }}
                                >
                                    <div style={{
                                        width: 50, height: 50, borderRadius: '50%',
                                        background: 'rgba(124, 92, 255, 0.2)', backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid rgba(124, 92, 255, 0.4)',
                                        boxShadow: '0 0 20px rgba(124, 92, 255, 0.3)'
                                    }}>
                                        <Eye size={24} color="white" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <span style={{ 
                                        padding: '2px 8px', borderRadius: 4, 
                                        background: 'rgba(124,92,255,0.1)', color: 'var(--accent-1)',
                                        fontSize: 10, fontWeight: 700
                                    }}>
                                        {asset.campaign_name}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>•</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={12} /> {new Date(asset.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <p style={{ 
                                    fontSize: 13, color: 'var(--text-primary)', 
                                    lineHeight: 1.5, display: '-webkit-box', 
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', marginBottom: 16, minHeight: 40
                                }}>
                                    {asset.prompt_used}
                                </p>

                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                                    <button 
                                        className="btn-primary" 
                                        style={{ 
                                            width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: 0, borderRadius: 16,
                                            boxShadow: '0 8px 16px rgba(124, 92, 255, 0.4)'
                                        }}
                                        title="Download Asset"
                                        onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}
                                    >
                                        <Download size={24} color="#FFFFFF" strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        style={{ 
                                            width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: 16, 
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '2px solid #7c5cff',
                                            cursor: 'pointer',
                                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="hover-bright"
                                        title="View Preview"
                                        onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); }}
                                    >
                                        <Eye size={24} color="#FFFFFF" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox / Preview Modal */}
            {selectedAsset && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(40px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'flex-start', overflowY: 'auto',
                }} 
                className="custom-scrollbar view-preview-modal" 
                onClick={() => setSelectedAsset(null)}>
                    
                    {/* Top Bar Actions */}
                    <div style={{ 
                        position: 'sticky', top: 0, width: '100%', display: 'flex', 
                        justifyContent: 'flex-end', gap: 15, padding: '30px', zIndex: 1001,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
                    }}>
                        <button
                            className="btn-primary"
                            onClick={(e) => { e.stopPropagation(); handleDownload(selectedAsset); }}
                            style={{ 
                                padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 8px 32px rgba(124, 92, 255, 0.4)'
                            }}
                        >
                            <Download size={18} /> Download
                        </button>
                        <button
                            onClick={() => setSelectedAsset(null)}
                            style={{
                                width: 48, height: 48, borderRadius: 14,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: '0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}
                            className="hover-bright"
                            aria-label="Close preview"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content Wrapper for Scrollability */}
                    <div style={{ 
                        width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', 
                        alignItems: 'center', gap: 40, padding: '0 40px 100px'
                    }} onClick={e => e.stopPropagation()}>
                        
                        {/* Media Container */}
                        <div style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minHeight: '60vh'
                        }}>
                            {selectedAsset.asset_type === 'image' ? (
                                <img 
                                    src={selectedAsset.gcs_url} 
                                    alt="Preview" 
                                    style={{ 
                                        maxWidth: '100%', maxHeight: '85vh', 
                                        borderRadius: 24, 
                                        boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                                        objectFit: 'contain',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }} 
                                />
                            ) : (
                                <video 
                                    src={selectedAsset.gcs_url} 
                                    controls autoPlay 
                                    style={{ 
                                        maxWidth: '100%', maxHeight: '85vh', 
                                        borderRadius: 24, 
                                        boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                            )}
                        </div>

                        {/* Info Bar */}
                        <div style={{ 
                            width: 'auto', minWidth: 600, maxWidth: '100%',
                            padding: '32px 40px', background: 'rgba(255,255,255,0.03)', 
                            backdropFilter: 'blur(20px)',
                            borderRadius: 24, border: '1px solid rgba(255,255,255,0.12)',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}>
                            <p style={{ color: 'white', fontSize: 18, lineHeight: 1.6, fontWeight: 600, margin: '0 0 16px' }}>
                                {selectedAsset.prompt_used}
                            </p>
                            <div style={{ 
                                display: 'flex', justifyContent: 'center', gap: 40,
                                color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500
                            }}>
                                <span>Campaign: <strong style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{selectedAsset.campaign_name}</strong></span>
                                <span>Agent: <strong style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{selectedAsset.agent_name}</strong></span>
                                <span>Created: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{new Date(selectedAsset.created_at).toLocaleDateString()}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .icon-button {
                    color: var(--text-primary);
                    background: var(--bg-tertiary);
                }
                .btn-secondary svg {
                    color: var(--text-primary);
                }
                .asset-card .btn-secondary {
                    background: rgba(255,255,255,0.04);
                    border-color: var(--border-default);
                }
                .icon-button svg {
                    stroke-width: 1.8;
                    color: currentColor;
                }
                .asset-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--accent-1) !important;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                }
                .asset-card:hover .asset-hover-overlay {
                    opacity: 1 !important;
                }
                .gradient-text {
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .view-preview-modal::-webkit-scrollbar {
                    width: 8px;
                }
                .view-preview-modal::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                }
                .view-preview-modal::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 4px;
                }
                .view-preview-modal::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.3);
                }
            `}</style>
        </div>
    );
}
