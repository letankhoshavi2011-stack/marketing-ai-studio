import React from 'react';
import { Layout, Briefcase, Globe, Zap, Shield, Rocket, Target, Users } from 'lucide-react';

interface WorkspaceAvatarProps {
    name: string;
    size?: number;
    fontSize?: number;
    borderRadius?: number;
}

/**
 * WorkspaceAvatar — Generates a deterministic colored avatar for workspaces.
 */
export const WorkspaceAvatar = ({
    name,
    size = 40,
    fontSize = 16,
    borderRadius = 10
}: WorkspaceAvatarProps) => {
    // Use the primary brand color for all workspace icons for maximum consistency
    const color = {
        bg: 'rgba(124,92,255,0.12)',
        color: '#7c5cff',
        border: 'rgba(124,92,255,0.3)'
    };

    // For consistency, use a standard layout icon
    const Icon = Layout;

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: borderRadius,
            background: color.bg,
            border: `1px solid ${color.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: color.color,
            fontWeight: 800,
            fontSize: fontSize,
            position: 'relative',
        }}>
            {/* We can use the icon or initials. Using initials for a cleaner look or icon if small */}
            {size > 30 ? (
                <Icon size={size * 0.5} />
            ) : (
                <span>{initials[0]}</span>
            )}
        </div>
    );
};
