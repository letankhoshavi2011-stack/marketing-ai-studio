import React from 'react';
import { VisualOutput } from './VisualOutput';
import { Wand2 } from 'lucide-react';

interface ImageEditorOutputProps {
    data: {
        assets?: any[];
        changes_made?: string;
    };
    compact?: boolean;
}

export const ImageEditorOutput: React.FC<ImageEditorOutputProps> = ({ data, compact = false }) => {
    if (!data) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
            {data.changes_made && (
                <div style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(34,211,238,0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                }}>
                    <Wand2 size={18} color="#0ea5e9" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Changes Made</span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {data.changes_made}
                        </span>
                    </div>
                </div>
            )}
            
            <VisualOutput {...data as any} compact={compact} />
        </div>
    );
};
