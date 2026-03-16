import React from 'react';
import { VisualOutput } from './VisualOutput';

export const HeroImageOutput = ({ data }: { data: any }) => (
    <VisualOutput
        title="Hero Image"
        reasoning={data?.reasoning || data?.analysis || data?.image_prompt}
        assets={data?.assets || []}
        aspect_ratio={data?.aspect_ratio}
        design_style={data?.style}
        context_updates={data?.context_updates}
    />
);
