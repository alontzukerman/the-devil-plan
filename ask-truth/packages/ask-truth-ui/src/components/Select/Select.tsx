import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type SelectVariant = 'light' | 'dark' | 'game';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: SelectVariant;
    size?: SelectSize;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

const getVariantClasses = (variant: SelectVariant): string => {
    const variants = {
        // Light variant - For light backgrounds
        light: 'bg-white border-neutral-300 text-neutral-900 focus:border-primary-500 focus:ring-primary-500',

        // Dark variant - For dark backgrounds (current game style)
        dark: 'bg-neutral-800 border-neutral-600 text-neutral-100 focus:border-primary-500 focus:ring-primary-500',

        // Game variant - For game screens with special styling
        game: 'bg-neutral-800 bg-opacity-80 border-neutral-600 text-neutral-100 focus:border-primary-500 focus:ring-primary-500 backdrop-blur-sm',
    };
    return variants[variant];
};

const getSizeClasses = (size: SelectSize): string => {
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
    };
    return sizes[size];
};

export const Select: React.FC<SelectProps> = ({
    variant = 'dark',
    size = 'md',
    fullWidth = false,
    error = false,
    helperText,
    options,
    placeholder,
    disabled,
    className,
    ...props
}) => {
    const { theme } = useTheme();

    const selectClasses = clsx(
        // Base styles
        'relative inline-flex items-center justify-center',
        'rounded-lg border transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'appearance-none cursor-pointer',

        // Variant styles
        getVariantClasses(variant),

        // Size styles
        getSizeClasses(size),

        // Error styles
        {
            'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20': error,
        },

        // Width styles
        {
            'w-full': fullWidth,
        },

        className
    );

    return (
        <div className={fullWidth ? 'w-full' : 'inline-block'}>
            <div className="relative">
                <select
                    className={selectClasses}
                    disabled={disabled}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

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