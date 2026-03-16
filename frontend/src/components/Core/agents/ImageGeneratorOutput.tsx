import React from 'react';
import { VisualOutput } from './VisualOutput';

interface ImageGeneratorOutputProps {
    data: any;
    compact?: boolean;
}

export const ImageGeneratorOutput: React.FC<ImageGeneratorOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;
    return (
        <VisualOutput
            title={data.title || 'Image Concepts'}
            reasoning={data.reasoning || data.prompt || data.description}
            assets={data.assets || []}
            aspect_ratio={data.aspect_ratio || data.assets?.[0]?.aspect_ratio}
            design_style={data.design_style || data.style}
            compact={compact}
            context_updates={data.context_updates}
        />
    );
};
