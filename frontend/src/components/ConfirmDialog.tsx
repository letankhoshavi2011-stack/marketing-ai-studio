/**
 * ConfirmDialog — Reusable confirmation modal with dark glassmorphism style.
 * Supports destructive (red) and default (primary) variants.
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onCancel();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, isLoading, onCancel]);

    // Focus trap — focus the dialog when opened
    useEffect(() => {
        if (isOpen) dialogRef.current?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const accentColor = isDanger ? '#ef4444' : 'var(--primary)';
    const accentBg = isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(124,92,255,0.12)';
    const confirmBg = isDanger ? '#ef4444' : 'var(--primary)';
    const confirmHover = isDanger ? '#dc2626' : '#6b48ff';

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={isLoading ? undefined : onCancel}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(6px)',
                    animation: 'confirmFadeIn 0.15s ease-out',
                }}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1001,
                    width: 420, maxWidth: 'calc(100vw - 40px)',
                    background: 'linear-gradient(165deg, rgba(22,22,36,0.99) 0%, rgba(14,14,24,0.99) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 18,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                    overflow: 'hidden',
                    animation: 'confirmSlideIn 0.2s ease-out',
                    outline: 'none',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '20px 22px 16px',
                }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: accentBg,
                        border: `1px solid ${accentColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <AlertTriangle size={20} color={accentColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: 16, fontWeight: 700,
                            color: 'var(--text-primary)', margin: 0,
                        }}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={isLoading ? undefined : onCancel}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8, padding: 6, cursor: isLoading ? 'not-allowed' : 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                            opacity: isLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 22px' }} />

                {/* Body */}
                <div style={{ padding: '18px 22px 24px' }}>
                    <p style={{
                        fontSize: 13.5, lineHeight: 1.7,
                        color: 'var(--text-secondary)', margin: 0,
                    }}>
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: 10,
                    padding: '0 22px 20px',
                }}>
                    <button
                        onClick={isLoading ? undefined : onCancel}
                        disabled={isLoading}
                        style={{
                            padding: '9px 20px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, color: 'var(--text-secondary)',
                            fontSize: 13, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            opacity: isLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={isLoading ? undefined : onConfirm}
                        disabled={isLoading}
                        style={{
                            padding: '9px 22px',
                            background: confirmBg,
                            border: 'none', borderRadius: 10, color: 'white',
                            fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: `0 3px 14px ${accentColor}40`,
                            transition: 'all 0.15s',
                            opacity: isLoading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = confirmHover; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = confirmBg; }}
                    >
                        {isLoading && (
                            <div style={{
                                width: 14, height: 14, borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                animation: 'spin 0.7s linear infinite',
                            }} />
                        )}
                        {isLoading ? 'Deleting...' : confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmSlideIn {
                    from { opacity: 0; transform: translate(-50%, -48%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
            `}</style>
        </>
    );
}
