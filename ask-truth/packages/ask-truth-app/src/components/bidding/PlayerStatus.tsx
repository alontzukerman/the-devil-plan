import React from 'react';

interface PlayerStatusProps {
    myPlayerName: string;
    opponentPlayerName: string;
    myCoins: number;
    opponentHasFewCoins: boolean;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
    myPlayerName,
    opponentPlayerName,
    myCoins,
    opponentHasFewCoins
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-lg">
            <div className="bg-neutral-600 p-4 rounded-md">
                <p><strong>{myPlayerName || 'You'}</strong></p>
                <p>
                    Coins: <span className="font-bold text-secondary-400">{myCoins}</span>
                </p>
            </div>
            <div className="bg-neutral-600 p-4 rounded-md">
                <p><strong>{opponentPlayerName || 'Opponent'}</strong></p>
                <p>
                    Coins: {opponentHasFewCoins ?
                        <span className="font-bold text-error">5 or Less</span> :
                        <span className="text-neutral-400">(Normal)</span>}
                </p>
            </div>
        </div>
    );
}; 