import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

interface MediaSliderProps {
    items: MediaItem[];
}

export default function MediaSlider({ items }: MediaSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!items || items.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

    const currentItem = items[currentIndex];

    const renderMedia = (item: MediaItem, fullSize = false) => {
        if (item.type === 'video') {
            return (
                <video
                    src={item.url}
                    controls
                    autoPlay
                    muted
                    loop
                    style={{
                        width: '100%',
                        height: fullSize ? 'auto' : '100%',
                        maxHeight: fullSize ? '90vh' : '400px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                    }}
                />
            );
        }
        return (
            <img
                src={item.url}
                alt={`Media ${currentIndex}`}
                style={{
                    width: '100%',
                    height: fullSize ? 'auto' : '100%',
                    maxHeight: fullSize ? '90vh' : '400px',
                    objectFit: 'contain',
                    borderRadius: '12px'
                }}
            />
        );
    };

    return (
        <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '16px',
                padding: '12px',
                minHeight: '200px',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
            }}>
                {renderMedia(currentItem)}

                {/* Navigation Buttons */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={next}
                            style={{
                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Expand Button */}
                <button
                    onClick={() => setIsFullscreen(true)}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '8px',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                    }}
                >
                    <Maximize2 size={16} />
                </button>

                {/* Indicators */}
                {items.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '8px', zIndex: 10
                    }}>
                        {items.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: i === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                                    cursor: 'pointer', transition: '0.2s'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '40px'
                }}>
                    <button
                        onClick={() => setIsFullscreen(false)}
                        style={{
                            position: 'absolute', top: '40px', right: '40px',
                            background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 1010
                        }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                        {renderMedia(currentItem, true)}
                    </div>

                    {items.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                style={{
                                    position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%',
                                    width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', zIndex: 1010
                                }}
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={next}
                                style={{
                                    position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%',
                                    width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', zIndex: 1010
                                }}
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
