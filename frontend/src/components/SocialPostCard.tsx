/**
 * SocialPostCard — Renders a single social media post with media gallery,
 * editable caption, and hashtag chips.
 */

import React, { useState } from 'react';
import { Image, Film, Clock, Hash, Edit3, Check } from 'lucide-react';

interface SocialAsset {
    asset_type: 'image' | 'video';
    gcs_url?: string;
    prompt_used?: string;
}

export interface SocialPostData {
    platform: string;
    caption: string;
    image_prompts: string[];
    video_prompts: string[];
    hashtags: string[];
    posting_time_suggestion: string;
    post_index: number;
    assets: SocialAsset[];
}

interface SocialPostCardProps {
    post: SocialPostData;
    index: number;
    editable?: boolean;
    onCaptionChange?: (index: number, newCaption: string) => void;
}

const PLATFORM_COLORS: Record<string, string> = {
    Instagram: '#E1306C',
    Facebook: '#1877F2',
    LinkedIn: '#0A66C2',
    Twitter: '#1DA1F2',
    Pinterest: '#E60023',
    TikTok: '#010101',
};

export default function SocialPostCard({ post, index, editable = true, onCaptionChange }: SocialPostCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState(post.caption);

    const images = (post.assets || []).filter(a => a.asset_type === 'image' && a.gcs_url);
    const videos = (post.assets || []).filter(a => a.asset_type === 'video' && a.gcs_url);
    const platformColor = PLATFORM_COLORS[post.platform] || '#7c5cff';

    const handleSaveCaption = () => {
        setIsEditing(false);
        if (onCaptionChange) {
            onCaptionChange(index, editedCaption);
        }
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
        }}>
            {/* Header: Platform badge + post number */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-default)',
                background: `linear-gradient(135deg, ${platformColor}10, transparent)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: `${platformColor}20`, color: platformColor,
                        border: `1px solid ${platformColor}30`,
                    }}>
                        {post.platform}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Post {index + 1}
                    </span>
                </div>
                {post.posting_time_suggestion && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, color: 'var(--text-muted)',
                    }}>
                        <Clock size={11} /> {post.posting_time_suggestion}
                    </span>
                )}
            </div>

            {/* Media Gallery */}
            {(images.length > 0 || videos.length > 0) && (
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Images: 2-column grid */}
                    {images.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: images.length === 1 ? '1fr' : '1fr 1fr',
                            gap: 8,
                        }}>
                            {images.map((img, i) => (
                                <div key={i} style={{
                                    position: 'relative', borderRadius: 10, overflow: 'hidden',
                                    background: 'var(--bg-primary)', aspectRatio: '1',
                                }}>
                                    <img
                                        src={img.gcs_url}
                                        alt={img.prompt_used || `Post image ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                    <span style={{
                                        position: 'absolute', top: 6, left: 6,
                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                        padding: '2px 8px', borderRadius: 8,
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        fontSize: 10, fontWeight: 600,
                                    }}>
                                        <Image size={10} /> {i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video */}
                    {videos.map((vid, i) => (
                        <div key={`vid-${i}`} style={{
                            position: 'relative', borderRadius: 10, overflow: 'hidden',
                            background: 'var(--bg-primary)',
                        }}>
                            <video
                                src={vid.gcs_url}
                                controls
                                style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#000' }}
                            />
                            <span style={{
                                position: 'absolute', top: 6, left: 6,
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                padding: '2px 8px', borderRadius: 8,
                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                fontSize: 10, fontWeight: 600,
                            }}>
                                <Film size={10} /> Video
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* No media placeholder */}
            {images.length === 0 && videos.length === 0 && (
                <div style={{
                    padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, color: 'var(--text-muted)', fontSize: 12,
                    background: 'var(--bg-primary)', margin: 12, borderRadius: 10,
                }}>
                    <Image size={14} />
                    <span>Media generating or unavailable</span>
                </div>
            )}

            {/* Caption */}
            <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    {isEditing ? (
                        <textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            style={{
                                flex: 1, fontSize: 13, lineHeight: 1.6,
                                color: 'var(--text-primary)', background: 'var(--bg-primary)',
                                border: `1px solid ${platformColor}40`,
                                borderRadius: 8, padding: '8px 10px',
                                resize: 'vertical', minHeight: 80,
                                fontFamily: 'inherit',
                            }}
                            autoFocus
                        />
                    ) : (
                        <p style={{
                            flex: 1, fontSize: 13, lineHeight: 1.6,
                            color: 'var(--text-primary)', margin: 0,
                            whiteSpace: 'pre-wrap',
                        }}>
                            {post.caption}
                        </p>
                    )}
                    {editable && (
                        <button
                            onClick={isEditing ? handleSaveCaption : () => setIsEditing(true)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: isEditing ? '#22c55e' : 'var(--text-muted)',
                                padding: 4, borderRadius: 6, flexShrink: 0,
                            }}
                            title={isEditing ? 'Save caption' : 'Edit caption'}
                        >
                            {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
                <div style={{
                    padding: '8px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 6,
                    borderTop: '1px solid var(--border-default)',
                }}>
                    {post.hashtags.map((tag, i) => (
                        <span key={i} style={{
                            fontSize: 11, color: platformColor,
                            background: `${platformColor}12`,
                            padding: '3px 8px', borderRadius: 8, fontWeight: 600,
                            border: `1px solid ${platformColor}20`,
                        }}>
                            {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
