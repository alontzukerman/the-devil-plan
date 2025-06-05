import React from 'react';
import { useTheme } from '../ThemeProvider';

export type StackDirection = 'vertical' | 'horizontal';
export type StackSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export interface StackProps {
    children: React.ReactNode;
    direction?: StackDirection;
    spacing?: StackSpacing;
    className?: string;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const spacingClasses: Record<StackSpacing, { vertical: string; horizontal: string }> = {
    xs: { vertical: 'space-y-1', horizontal: 'space-x-1' },
    sm: { vertical: 'space-y-2', horizontal: 'space-x-2' },
    md: { vertical: 'space-y-4', horizontal: 'space-x-4' },
    lg: { vertical: 'space-y-6', horizontal: 'space-x-6' },
    xl: { vertical: 'space-y-8', horizontal: 'space-x-8' },
    '2xl': { vertical: 'space-y-10', horizontal: 'space-x-10' },
    '3xl': { vertical: 'space-y-12', horizontal: 'space-x-12' },
    '4xl': { vertical: 'space-y-16', horizontal: 'space-x-16' },
};

const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};

const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
};

export const Stack: React.FC<StackProps> = ({
    children,
    direction = 'vertical',
    spacing = 'md',
    className = '',
    align = 'stretch',
    justify = 'start',
}) => {
    const { theme } = useTheme();

    const isVertical = direction === 'vertical';
    const spacingClass = spacingClasses[spacing][direction];

    const stackClasses = [
        'flex',
        isVertical ? 'flex-col' : 'flex-row',
        spacingClass,
        alignClasses[align],
        justifyClasses[justify],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={stackClasses}>
            {children}
        </div>
    );
}; 