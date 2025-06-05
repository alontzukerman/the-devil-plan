import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type LabelSize = 'sm' | 'md' | 'lg';
export type LabelVariant = 'light' | 'dark';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    size?: LabelSize;
    variant?: LabelVariant;
    required?: boolean;
    children: React.ReactNode;
}

const getSizeClasses = (size: LabelSize): string => {
    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };
    return sizes[size];
};

const getVariantClasses = (variant: LabelVariant): string => {
    const variants = {
        light: 'text-neutral-900',
        dark: 'text-neutral-200',
    };
    return variants[variant];
};

export const Label: React.FC<LabelProps> = ({
    size = 'md',
    variant = 'dark',
    required = false,
    className,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const labelClasses = clsx(
        // Base styles
        'block font-medium mb-2',

        // Size styles
        getSizeClasses(size),

        // Variant styles
        getVariantClasses(variant),

        className
    );

    return (
        <label className={labelClasses} {...props}>
            {children}
            {required && (
                <span className="text-red-500 ml-1" aria-label="required">
                    *
                </span>
            )}
        </label>
    );
}; 