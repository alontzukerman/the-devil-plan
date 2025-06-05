import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type InputVariant = 'light' | 'dark' | 'game';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'disabled' | 'focused';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: InputVariant;
    size?: InputSize;
    state?: InputState;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
}

const getVariantClasses = (variant: InputVariant): string => {
    const variants = {
        // Light variant - For light backgrounds
        light: 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500 focus:border-primary-500 focus:ring-primary-500',

        // Dark variant - For dark backgrounds (current game style)
        dark: 'bg-neutral-800 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:ring-primary-500',

        // Game variant - For game screens with special styling
        game: 'bg-neutral-800 bg-opacity-80 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:ring-primary-500 backdrop-blur-sm',
    };
    return variants[variant];
};

const getSizeClasses = (size: InputSize): string => {
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
    };
    return sizes[size];
};

const getStateClasses = (state: InputState, error?: boolean): string => {
    if (error) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20';
    }

    const states = {
        default: '',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20',
        disabled: 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-700',
        focused: 'border-primary-500 ring-primary-500',
    };
    return states[state];
};

export const Input: React.FC<InputProps> = ({
    variant = 'dark',
    size = 'md',
    state = 'default',
    fullWidth = false,
    error = false,
    helperText,
    disabled,
    className,
    ...props
}) => {
    const { theme } = useTheme();

    const inputClasses = clsx(
        // Base styles
        'relative inline-flex items-center justify-center',
        'rounded-lg border transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        // Variant styles
        getVariantClasses(variant),

        // Size styles
        getSizeClasses(size),

        // State styles
        getStateClasses(state, error),

        // Width styles
        {
            'w-full': fullWidth,
        },

        className
    );

    const isDisabled = disabled || state === 'disabled';

    return (
        <div className={fullWidth ? 'w-full' : 'inline-block'}>
            <input
                className={inputClasses}
                disabled={isDisabled}
                {...props}
            />
            {helperText && (
                <p className={clsx(
                    'mt-1 text-sm',
                    error ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400'
                )}>
                    {helperText}
                </p>
            )}
        </div>
    );
}; 