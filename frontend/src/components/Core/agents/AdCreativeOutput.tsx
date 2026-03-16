import React from 'react';
import { VisualOutput } from './VisualOutput';

export const AdCreativeOutput = ({ data }: { data: any }) => (
    <VisualOutput
        title="Ad Creative"
        reasoning={data?.reasoning || data?.analysis || data?.image_prompt}
        assets={data?.assets || []}
        aspect_ratio={data?.aspect_ratio}
        design_style={data?.design_style}
        context_updates={data?.context_updates}
    />
);
