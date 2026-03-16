import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ColorInputProps {
    colors: string[];
    onChange: (v: string[]) => void;
    max?: number;
}

/**
 * Shared color picker used by Brand Identity and Logo Designer.
 * Combines native color input, hex text entry, and removable swatches.
 */
export function ColorInput({ colors, onChange, max = 5 }: ColorInputProps) {
    const [hexInput, setHexInput] = useState('#');

    const addColor = (hex: string) => {
        const normalized = hex.toLowerCase().trim();
        if (!/^#[0-9a-f]{6}$/i.test(normalized) || colors.length >= max) return;
        if (colors.includes(normalized)) return;
        onChange([...colors, normalized]);
        setHexInput('#');
    };

    const removeColor = (idx: number) => {
        onChange(colors.filter((_, i) => i !== idx));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Current swatches */}
            {colors.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {colors.map((hex, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: hex, border: '2px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }} />
                            <button
                                type="button"
                                onClick={() => removeColor(i)}
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#ef4444', border: 'none', color: 'white',
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                <X size={12} />
                            </button>
                            <p style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, fontFamily: 'monospace' }}>
                                {hex}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add color controls */}
            {colors.length < max && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                        <input
                            type="color"
                            value={hexInput.length === 7 ? hexInput : '#7c5cff'}
                            onChange={e => {
                                setHexInput(e.target.value);
                                addColor(e.target.value);
                            }}
                            style={{
                                width: '100%', height: '100%', border: 'none', cursor: 'pointer',
                                borderRadius: 10, padding: 0, background: 'none',
                                appearance: 'none',
                            }}
                        />
                    </div>
                    <input
                        type="text"
                        value={hexInput}
                        onChange={e => setHexInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor(hexInput); } }}
                        placeholder="#000000"
                        maxLength={7}
                        style={{
                            flex: 1, padding: '11px 14px', borderRadius: 10,
                            border: '1.5px solid var(--border-default)',
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            fontSize: 14, outline: 'none', fontFamily: 'monospace',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => addColor(hexInput)}
                        style={{
                            padding: '11px 20px', borderRadius: 10,
                            background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.2)',
                            color: 'var(--primary)', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>
            )}

            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {colors.length}/{max} colors — AI will build a full palette around these hints
            </p>
        </div>
    );
}
