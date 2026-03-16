import React from 'react';
import { VisualOutput } from './VisualOutput';

export const ProductPhotoshootOutput = ({ data }: { data: any }) => (
    <VisualOutput
        title="Product Photoshoot"
        reasoning={data?.reasoning || data?.analysis || data?.image_prompt}
        assets={data?.assets || []}
        aspect_ratio={data?.aspect_ratio}
        design_style={data?.background_style}
        context_updates={data?.context_updates}
    />
);
