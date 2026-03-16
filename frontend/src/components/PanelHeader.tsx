import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PanelHeaderProps {
    title: string;
    subtitle: React.ReactNode;
    Icon: LucideIcon;
    iconColor?: string;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ title, subtitle, Icon, iconColor = '#7c5cff' }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }} className="animate-fade-in header-container">
            <div
                className="hide-on-mobile icon-box"
                style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(124, 92, 255, 0.12)',
                    border: '1px solid rgba(124, 92, 255, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 20px rgba(124, 92, 255, 0.1)',
                }}
            >
                <Icon size={20} color={iconColor} style={{ filter: 'drop-shadow(0 0 3px rgba(124, 92, 255, 0.3))' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ 
                    fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }} className="mobile-title">
                    {title}
                </h1>
                <div style={{ color: 'var(--text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} className="mobile-subtitle">
                    {subtitle}
                </div>
            </div>
            <style>{`
                .header-container {
                    padding: 4px 0;
                }
                .icon-box {
                    transition: all 0.3s ease;
                }
                .icon-box:hover {
                    box-shadow: 0 0 25px rgba(124, 92, 255, 0.2);
                    border-color: rgba(124, 92, 255, 0.4);
                    transform: translateY(-1px);
                }
                .mobile-title { font-size: 26px; }
                .mobile-subtitle { font-size: 13px; font-weight: 500; }
                @media (max-width: 768px) {
                    .mobile-title { font-size: 20px !important; }
                    .mobile-subtitle { font-size: 12px !important; }
                    .header-container { gap: 12px !important; }
                }
            `}</style>
        </div>
    );
};

export default PanelHeader;
