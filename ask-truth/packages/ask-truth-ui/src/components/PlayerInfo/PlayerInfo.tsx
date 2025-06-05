import React from 'react';
import { useTheme } from '../ThemeProvider';
import { CoinDisplay } from '../CoinDisplay';

export type PlayerInfoVariant = 'default' | 'highlighted' | 'muted';
export type PlayerInfoSize = 'sm' | 'md' | 'lg';

export interface PlayerInfoProps {
    /** Player's name */
    playerName: string;
    /** Number of coins (if exact amount is known) */
    coins?: number;
    /** Whether player has few coins (when exact amount is unknown) */
    hasFewCoins?: boolean;
    /** Visual variant */
    variant?: PlayerInfoVariant;
    /** Size of the component */
    size?: PlayerInfoSize;
    /** Optional status indicator */
    status?: string;
    /** Whether this is the current player */
    isCurrentPlayer?: boolean;
    /** Optional additional info to display */
    additionalInfo?: string;
    /** Custom className */
    className?: string;
}

const getSizeClasses = (size: PlayerInfoSize) => {
    switch (size) {
        case 'sm':
            return {
                container: 'p-3',
                name: 'text-base',
                status: 'text-xs',
                info: 'text-xs'
            };
        case 'lg':
            return {
                container: 'p-6',
                name: 'text-xl',
                status: 'text-sm',
                info: 'text-sm'
            };
        default:
            return {
                container: 'p-4',
                name: 'text-lg',
                status: 'text-sm',
                info: 'text-sm'
            };
    }
};

const getVariantClasses = (variant: PlayerInfoVariant, isCurrentPlayer: boolean) => {
    if (isCurrentPlayer) {
        return 'bg-primary-900/30 border-primary-500/40 shadow-primary-500/20 shadow-lg';
    }

    switch (variant) {
        case 'highlighted':
            return 'bg-info bg-opacity-30 border-info border-opacity-40 shadow-info shadow-opacity-20 shadow-lg';
        case 'muted':
            return 'bg-neutral-800/30 border-neutral-600/40';
        default:
            return 'bg-neutral-600/80 border-neutral-500/40';
    }
};

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
    playerName,
    coins,
    hasFewCoins = false,
    variant = 'default',
    size = 'md',
    status,
    isCurrentPlayer = false,
    additionalInfo,
    className = ''
}) => {
    const { theme } = useTheme();

    const sizeClasses = getSizeClasses(size);
    const variantClasses = getVariantClasses(variant, isCurrentPlayer);

    const displayName = playerName || (isCurrentPlayer ? 'You' : 'Opponent');

    return (
        <div className={`rounded-lg border ${sizeClasses.container} ${variantClasses} ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className={`font-semibold ${sizeClasses.name} ${isCurrentPlayer ? 'text-primary-300' : 'text-info'}`}>
                        {displayName}
                        {isCurrentPlayer && (
                            <span className="ml-2 text-primary-400 text-sm font-normal">(You)</span>
                        )}
                    </h3>

                    {status && (
                        <p className={`${sizeClasses.status} text-neutral-300 mt-1`}>
                            {status}
                        </p>
                    )}

                    {additionalInfo && (
                        <p className={`${sizeClasses.info} text-neutral-400 mt-1`}>
                            {additionalInfo}
                        </p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    {typeof coins === 'number' ? (
                        <CoinDisplay
                            amount={coins}
                            size={size === 'lg' ? 'md' : 'sm'}
                            label="Coins"
                        />
                    ) : hasFewCoins ? (
                        <div className="text-error font-semibold text-sm">
                            <span className="opacity-70">Coins:</span> ≤5
                        </div>
                    ) : (
                        <div className="text-neutral-400 text-sm">
                            <span className="opacity-70">Coins:</span> Normal
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 