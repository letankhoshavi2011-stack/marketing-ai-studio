import React from 'react';
import { VisualOutput } from './VisualOutput';

interface InfographicOutputProps {
    data: {
        assets?: any[];
    };
    compact?: boolean;
}

export const InfographicOutput: React.FC<InfographicOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    // Infographics usually return just an image asset, similar to Mockups or Photoshoots
    // The base VisualOutput handles the image grid beautifully.
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            <VisualOutput {...data as any} compact={compact} />
        </div>
    );
};
