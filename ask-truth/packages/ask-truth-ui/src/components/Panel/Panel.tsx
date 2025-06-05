import React from 'react';
import { useTheme } from '../ThemeProvider';

export type PanelVariant = 'default' | 'dark' | 'game';

export interface PanelProps {
    children: React.ReactNode;
    variant?: PanelVariant;
    className?: string;
}

const variantClasses: Record<PanelVariant, string> = {
    default: 'bg-white bg-opacity-90 text-neutral-900',
    dark: 'bg-neutral-700 bg-opacity-50 text-white backdrop-blur-sm',
    game: 'bg-neutral-700 text-white',
};

export const Panel: React.FC<PanelProps> = ({
    children,
    variant = 'default',
    className = '',
}) => {
    const { theme } = useTheme();

    const panelClasses = [
        'p-6 md:p-8',
        'rounded-lg',
        'shadow-xl',
        variantClasses[variant],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={panelClasses}>
            {children}
        </div>
    );
}; 