import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

const getVariantClasses = (variant: ButtonVariant): string => {
    const variants = {
        // Primary - Beautiful Emerald Gradient
        primary: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white border border-primary-700/30 shadow-lg shadow-primary-600/30 hover:from-primary-400 hover:via-primary-500 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 focus:ring-primary-500 active:scale-[0.98] font-semibold transition-all duration-300 ease-out',

        // Secondary - Rich Copper Gradient
        secondary: 'bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white border border-secondary-700/30 shadow-lg shadow-secondary-600/30 hover:from-secondary-400 hover:via-secondary-500 hover:to-secondary-600 hover:shadow-xl hover:shadow-secondary-500/40 hover:scale-105 focus:ring-secondary-500 active:scale-[0.98] transition-all duration-300 ease-out',

        // Danger - Classic Red
        danger: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white border border-red-700/30 shadow-lg shadow-red-600/30 hover:from-red-400 hover:via-red-500 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 focus:ring-red-500 active:scale-[0.98] transition-all duration-300 ease-out',

        // Ghost - Subtle with warm neutrals
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:ring-neutral-400 border-2 border-neutral-300 hover:border-neutral-400 hover:shadow-md active:scale-[0.98] transition-all duration-200 ease-out',
    };
    return variants[variant];
};

const getSizeClasses = (size: ButtonSize): string => {
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
    };
    return sizes[size];
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    className,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const buttonClasses = clsx(
        // Base styles - Enhanced with better styling
        'relative inline-flex items-center justify-center',
        'font-semibold rounded-xl',
        'transform-gpu',
        'focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-neutral-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',

        // Variant styles
        getVariantClasses(variant),

        // Size styles
        getSizeClasses(size),

        // Width styles
        {
            'w-full': fullWidth,
        },

        // Loading state
        {
            'cursor-wait': loading,
        },

        className
    );

    const isDisabled = disabled || loading;

    return (
        <button
            className={buttonClasses}
            disabled={isDisabled}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}; 