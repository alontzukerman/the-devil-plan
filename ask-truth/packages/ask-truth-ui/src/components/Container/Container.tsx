import React from 'react';
import { useTheme } from '../ThemeProvider';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps {
    children: React.ReactNode;
    size?: ContainerSize;
    className?: string;
    centered?: boolean;
}

const sizeClasses: Record<ContainerSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl',
    full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
    children,
    size = 'xl',
    className = '',
    centered = true,
}) => {
    const { theme } = useTheme();

    const containerClasses = [
        'w-full',
        sizeClasses[size],
        centered ? 'mx-auto' : '',
        'px-4',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {children}
        </div>
    );
}; 