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

const getVariantStyles = (variant: ButtonVariant): string => {
    const variants = {
        primary: 'bg-primary-500 text-neutral-900 hover:bg-primary-400 focus:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-500 focus:ring-secondary-500',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
        ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-700 focus:ring-neutral-500 border border-neutral-600',
    };
    return variants[variant];
};

const getSizeStyles = (size: ButtonSize): string => {
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
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

    const baseStyles = [
        'inline-flex items-center justify-center',
        'font-semibold rounded-lg',
        'transition-all duration-150 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800',
        'disabled:bg-neutral-500 disabled:text-neutral-400 disabled:cursor-not-allowed',
    ];

    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);
    const widthStyles = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || loading;

    return (
        <button
            className={clsx(
                baseStyles,
                variantStyles,
                sizeStyles,
                widthStyles,
                className
            )}
            disabled={isDisabled}
            {...props}
            style={{
                // Use CSS custom properties from theme
                backgroundColor: variant === 'primary' ? `var(--color-primary-500)` : undefined,
                color: variant === 'primary' ? `var(--color-neutral-900)` : undefined,
                ...props.style,
            }}
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