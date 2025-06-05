import React from 'react';
import { useTheme } from '../ThemeProvider';

export type TimerVariant = 'default' | 'danger' | 'warning' | 'success';
export type TimerSize = 'sm' | 'md' | 'lg';

export interface TimerProps {
    /** The time left in seconds */
    timeLeft: number;
    /** Whether the timer is currently active/running */
    isActive: boolean;
    /** Visual variant of the timer */
    variant?: TimerVariant;
    /** Size of the timer */
    size?: TimerSize;
    /** Optional title to display above the timer */
    title?: string;
    /** Whether to show a progress bar */
    showProgress?: boolean;
    /** Total time for progress calculation (optional) */
    totalTime?: number;
    /** Custom className */
    className?: string;
}

const getVariantClasses = (variant: TimerVariant) => {
    switch (variant) {
        case 'danger':
            return 'text-error border-error';
        case 'warning':
            return 'text-warning border-warning';
        case 'success':
            return 'text-success border-success';
        default:
            return 'text-info border-info';
    }
};

const getSizeClasses = (size: TimerSize) => {
    switch (size) {
        case 'sm':
            return 'text-lg px-3 py-1';
        case 'lg':
            return 'text-4xl px-6 py-3';
        default:
            return 'text-2xl px-4 py-2';
    }
};

export const Timer: React.FC<TimerProps> = ({
    timeLeft,
    isActive,
    variant = 'default',
    size = 'md',
    title,
    showProgress = false,
    totalTime,
    className = ''
}) => {
    const { theme } = useTheme();

    // Auto-determine variant based on time left
    const autoVariant = isActive && timeLeft <= 3 ? 'danger' :
        isActive && timeLeft <= 5 ? 'warning' :
            variant;

    const variantClasses = getVariantClasses(autoVariant);
    const sizeClasses = getSizeClasses(size);

    const progressPercentage = totalTime && showProgress ?
        Math.max(0, Math.min(100, (timeLeft / totalTime) * 100)) : 0;

    return (
        <div className={`text-center ${className}`}>
            {title && (
                <h2 className={`font-semibold mb-2 ${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-base' : 'text-lg'} ${variantClasses.split(' ')[0]}`}>
                    {title}
                </h2>
            )}

            <div className={`inline-flex items-center justify-center border-2 rounded-lg font-mono font-bold ${variantClasses} ${sizeClasses} ${isActive ? 'animate-pulse' : ''}`}>
                <span className="tabular-nums">
                    {Math.max(0, timeLeft)}s
                </span>
            </div>

            {showProgress && totalTime && (
                <div className="mt-2 w-full bg-neutral-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ease-linear ${autoVariant === 'danger' ? 'bg-error' :
                            autoVariant === 'warning' ? 'bg-warning' :
                                'bg-info'
                            }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}; 