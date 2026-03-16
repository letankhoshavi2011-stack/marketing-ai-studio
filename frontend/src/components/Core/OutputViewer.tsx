import React, { useState } from 'react';
import {
    Image as ImageIcon,
    Video as VideoIcon,
    FileText,
    Download,
    ExternalLink,
    CheckCircle2,
    Copy,
    LayoutGrid,
    Type
} from 'lucide-react';
import MarketingEditor from '../TipTap/Editor';

interface Asset {
    id: string;
    url: string;
    type: 'image' | 'video' | 'file';
    title: string;
    metadata?: Record<string, any>;
}

interface OutputViewerProps {
    textContent: string;
    assets: Asset[];
    structuredData?: any;
    onUpdateText: (content: string) => void;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
    textContent,
    assets = [],
    structuredData,
    onUpdateText
}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'assets' | 'data'>('content');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 24,
                padding: '0 16px',
                borderBottom: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)'
            }}>
                <TabButton
                    active={activeTab === 'content'}
                    onClick={() => setActiveTab('content')}
                    icon={<Type size={16} />}
                    label="Rich Text"
                />
                <TabButton
                    active={activeTab === 'assets'}
                    onClick={() => setActiveTab('assets')}
                    icon={<ImageIcon size={16} />}
                    label={`Assets (${assets.length})`}
                />
                {structuredData && (
                    <TabButton
                        active={activeTab === 'data'}
                        onClick={() => setActiveTab('data')}
                        icon={<LayoutGrid size={16} />}
                        label="Structured Data"
                    />
                )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
                {activeTab === 'content' && (
                    <div style={{ height: '100%', padding: 16 }}>
                        <MarketingEditor
                            initialContent={textContent.includes('<') ? textContent : `<p>${textContent.replace(/\n/g, '<br/>')}</p>`}
                            onUpdate={onUpdateText}
                        />
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div style={{ padding: 24 }}>
                        {assets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                <p>No assets generated for this run.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 20
                            }}>
                                {assets.map(asset => (
                                    <AssetCard key={asset.id} asset={asset} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'data' && structuredData && (
                    <div style={{ padding: 24 }}>
                        <pre style={{
                            background: 'var(--bg-secondary)',
                            padding: 16,
                            borderRadius: 8,
                            border: '1px solid var(--border-default)',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            overflowX: 'auto'
                        }}>
                            {JSON.stringify(structuredData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 4px',
            fontSize: 13,
            fontWeight: 600,
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: '0.2s',
            background: 'none',
            border: 'none',
            borderRight: 'none',
            borderLeft: 'none',
            borderTop: 'none'
        }}
    >
        {icon}
        {label}
    </button>
);

const AssetCard = ({ asset }: { asset: Asset }) => (
    <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        transition: '0.2s',
        cursor: 'default'
    }} className="group hover:border-[var(--primary)] hover:shadow-lg">
        <div style={{ position: 'relative', aspectRatio: '1/1', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <VideoIcon size={48} color="white" opacity={0.5} />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button style={{ padding: 8, background: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} title="Download">
                    <Download size={18} />
                </button>
                <button style={{ padding: 8, background: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} title="View Full">
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
        <div style={{ padding: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {asset.title}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {asset.type.toUpperCase()} • Generated Core
            </p>
        </div>
    </div>
);
