import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({ 
    checked, 
    onChange, 
    disabled = false,
    size = 'md' 
}) => {
    const dimensions = {
        sm: { width: 32, height: 18, thumb: 14 },
        md: { width: 40, height: 22, thumb: 18 },
        lg: { width: 48, height: 26, thumb: 22 },
    }[size];

    return (
        <label style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: dimensions.width,
            height: dimensions.height,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            userSelect: 'none',
            flexShrink: 0,
        }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            />
            <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: checked ? 'var(--primary, #7c5cff)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: dimensions.height,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1.5px solid ${checked ? 'var(--primary, #7c5cff)' : 'var(--border-default, rgba(255, 255, 255, 0.12))'}`,
                boxSizing: 'border-box',
            }}>
                <span style={{
                    position: 'absolute',
                    height: dimensions.thumb,
                    width: dimensions.thumb,
                    left: checked ? dimensions.width - dimensions.thumb - 4 : 2,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: checked ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.2)',
                }} />
            </span>
        </label>
    );
};
