import React from 'react';

/**
 * MarketingAI Application Logo
 */
export const AppLogo = ({ size = 24, className = "", style = {} }: { size?: number, className?: string, style?: React.CSSProperties }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
    >
        <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c5cff" />
                <stop offset="50%" stopColor="#c05cff" />
                <stop offset="100%" stopColor="#ff5ca0" />
            </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
        <path
            d="M10 28V12L20 22L30 12V28"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="20" cy="18" r="3" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
    </svg>
);

/**
 * Google Gemini Brand Icon
 */
export const GeminiLogo = ({ size = 20, className = "", style = {} }: { size?: number, className?: string, style?: React.CSSProperties }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
    >
        <path
            d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
            fill="url(#gemini-gradient)"
        />
        <defs>
            <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4E8CFF" />
                <stop offset="0.5" stopColor="#B468FF" />
                <stop offset="100%" stopColor="#FF68A8" />
            </linearGradient>
        </defs>
    </svg>
);

/**
 * Branded Watermark for Canvas
 */
export const CanvasWatermark = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: 0.15,
        filter: 'grayscale(1)',
        pointerEvents: 'none',
        userSelect: 'none',
        padding: '20px',
    }}>
        <AppLogo size={32} />
        <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                Marketing<span style={{ color: 'var(--accent-1)' }}>AI</span>
            </div>
            <div style={{ fontSize: 10, color: 'white', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Studio Canvas
            </div>
        </div>
    </div>
);
