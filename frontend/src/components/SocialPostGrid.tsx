/**
 * SocialPostGrid — Container that renders N SocialPostCard components.
 * Vertical stack for 1-2 posts, 2-column grid for 3+.
 */

import React from 'react';
import SocialPostCard, { SocialPostData } from './SocialPostCard';

interface SocialPostGridProps {
    posts: SocialPostData[];
    editable?: boolean;
    onCaptionChange?: (index: number, newCaption: string) => void;
}

export default function SocialPostGrid({ posts, editable = true, onCaptionChange }: SocialPostGridProps) {
    if (!posts || posts.length === 0) return null;

    const useGrid = posts.length >= 3;

    return (
        <div style={{
            display: useGrid ? 'grid' : 'flex',
            flexDirection: useGrid ? undefined : 'column',
            gridTemplateColumns: useGrid ? 'repeat(2, 1fr)' : undefined,
            gap: 16,
            width: '100%',
        }}>
            {posts.map((post, i) => (
                <SocialPostCard
                    key={i}
                    post={post}
                    index={i}
                    editable={editable}
                    onCaptionChange={onCaptionChange}
                />
            ))}
        </div>
    );
}
