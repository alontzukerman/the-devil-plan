import React from 'react';
import { useTheme } from '../ThemeProvider';

export type GameStatusType = 'info' | 'success' | 'warning' | 'error' | 'waiting';
export type GameStatusSize = 'sm' | 'md' | 'lg';

export interface GameStatusProps {
    /** The status message to display */
    message: string;
    /** Type of status for visual styling */
    type?: GameStatusType;
    /** Size of the status display */
    size?: GameStatusSize;
    /** Whether to show a loading spinner */
    showSpinner?: boolean;
    /** Optional icon to display */
    icon?: React.ReactNode;
    /** Custom className */
    className?: string;
}

const getTypeClasses = (type: GameStatusType) => {
    switch (type) {
        case 'success':
            return 'text-success bg-success bg-opacity-20 border-success border-opacity-30';
        case 'warning':
            return 'text-warning bg-warning bg-opacity-20 border-warning border-opacity-30';
        case 'error':
            return 'text-error bg-error bg-opacity-20 border-error border-opacity-30';
        case 'waiting':
            return 'text-primary-200 bg-primary-900 bg-opacity-20 border-primary-500 border-opacity-30';
        default:
            return 'text-info bg-info bg-opacity-20 border-info border-opacity-30';
    }
};

const getSizeClasses = (size: GameStatusSize) => {
    switch (size) {
        case 'sm':
            return {
                container: 'px-3 py-2 text-sm',
                text: 'text-sm',
                icon: 'w-4 h-4'
            };
        case 'lg':
            return {
                container: 'px-6 py-4 text-lg',
                text: 'text-lg',
                icon: 'w-6 h-6'
            };
        default:
            return {
                container: 'px-4 py-3 text-base',
                text: 'text-base',
                icon: 'w-5 h-5'
            };
    }
};

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
);

const getDefaultIcon = (type: GameStatusType) => {
    switch (type) {
        case 'success':
            return (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'warning':
            return (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        default:
            return null;
    }
};

export const GameStatus: React.FC<GameStatusProps> = ({
    message,
    type = 'info',
    size = 'md',
    showSpinner = false,
    icon,
    className = ''
}) => {
    const { theme } = useTheme();

    const typeClasses = getTypeClasses(type);
    const sizeClasses = getSizeClasses(size);

    const displayIcon = showSpinner ? (
        <LoadingSpinner className={sizeClasses.icon} />
    ) : icon ? (
        <div className={sizeClasses.icon}>{icon}</div>
    ) : (
        getDefaultIcon(type) && (
            <div className={sizeClasses.icon}>
                {getDefaultIcon(type)}
            </div>
        )
    );

    return (
        <div className={`flex items-center justify-center gap-3 rounded-lg border ${sizeClasses.container} ${typeClasses} ${className}`}>
            {displayIcon}
            <span className={`${sizeClasses.text} text-center font-medium`}>
                {message}
            </span>
        </div>
    );
}; 