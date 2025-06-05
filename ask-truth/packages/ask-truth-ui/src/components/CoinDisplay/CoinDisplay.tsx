import React from 'react';
import { useTheme } from '../ThemeProvider';

export type CoinDisplaySize = 'sm' | 'md' | 'lg';
export type CoinDisplayVariant = 'default' | 'warning' | 'danger';

export interface CoinDisplayProps {
    /** The number of coins to display */
    amount: number;
    /** Size of the coin display */
    size?: CoinDisplaySize;
    /** Visual variant based on coin status */
    variant?: CoinDisplayVariant;
    /** Optional label to show before the amount */
    label?: string;
    /** Whether to show the coin icon */
    showIcon?: boolean;
    /** Custom className */
    className?: string;
}

const getSizeClasses = (size: CoinDisplaySize) => {
    switch (size) {
        case 'sm':
            return {
                container: 'text-sm px-2 py-1',
                icon: 'w-3 h-3',
                text: 'text-sm'
            };
        case 'lg':
            return {
                container: 'text-xl px-4 py-2',
                icon: 'w-6 h-6',
                text: 'text-xl'
            };
        default:
            return {
                container: 'text-base px-3 py-1.5',
                icon: 'w-4 h-4',
                text: 'text-base'
            };
    }
};

const getVariantClasses = (variant: CoinDisplayVariant, amount: number) => {
    // Auto-determine variant based on amount if not specified
    const autoVariant = variant !== 'default' ? variant :
        amount <= 2 ? 'danger' :
            amount <= 5 ? 'warning' :
                'default';

    switch (autoVariant) {
        case 'danger':
            return 'text-error bg-error bg-opacity-20 border-error border-opacity-30';
        case 'warning':
            return 'text-warning bg-warning bg-opacity-20 border-warning border-opacity-30';
        default:
            return 'text-secondary-400 bg-secondary-900 bg-opacity-20 border-secondary-500 border-opacity-30';
    }
};

const CoinIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`${className} fill-current`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.8" />
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            className="font-bold"
        >
            $
        </text>
    </svg>
);

export const CoinDisplay: React.FC<CoinDisplayProps> = ({
    amount,
    size = 'md',
    variant = 'default',
    label,
    showIcon = true,
    className = ''
}) => {
    const { theme } = useTheme();

    const sizeClasses = getSizeClasses(size);
    const variantClasses = getVariantClasses(variant, amount);

    return (
        <div className={`inline-flex items-center gap-2 rounded-lg border font-semibold ${sizeClasses.container} ${variantClasses} ${className}`}>
            {label && (
                <span className={`${sizeClasses.text} opacity-90`}>
                    {label}:
                </span>
            )}

            <div className="flex items-center gap-1">
                {showIcon && (
                    <CoinIcon className={sizeClasses.icon} />
                )}
                <span className={`${sizeClasses.text} font-bold tabular-nums`}>
                    {amount}
                </span>
            </div>
        </div>
    );
}; 