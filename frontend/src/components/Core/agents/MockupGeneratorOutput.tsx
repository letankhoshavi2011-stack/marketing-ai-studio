import React from 'react';
import { VisualOutput } from './VisualOutput';

export const MockupGeneratorOutput = ({ data }: { data: any }) => (
    <VisualOutput
        title="Mockups"
        reasoning={data?.reasoning || data?.analysis || data?.image_prompt}
        assets={data?.assets || []}
        context_updates={data?.context_updates}
    />
);
