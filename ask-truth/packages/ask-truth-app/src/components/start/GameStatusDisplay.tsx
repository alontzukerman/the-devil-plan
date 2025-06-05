import React from 'react';
import type { Player } from '../../utils/types/startScreen.types';

interface GameStatusDisplayProps {
    createdGameId: string | null;
    isWaitingForOpponent: boolean;
    gamePlayers: Player[];
    currentSocketId?: string;
}

export const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
    createdGameId,
    isWaitingForOpponent,
    gamePlayers,
    currentSocketId
}) => {
    return (
        <div className="text-center p-6 bg-neutral-700 bg-opacity-50 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm">
            {createdGameId && (
                <div className="p-4 bg-success bg-opacity-30 border-l-4 border-primary-500 mb-4 rounded-md">
                    <p className="text-md text-primary-200 mb-2">
                        Game Created! Share this ID with your friend:
                    </p>
                    <p className="font-title text-3xl text-success tracking-wider mb-3 select-all">
                        {createdGameId}
                    </p>
                </div>
            )}

            {isWaitingForOpponent && (
                <p className="text-lg text-neutral-300 italic mb-2">
                    Waiting for opponent to join...
                </p>
            )}

            {gamePlayers.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                        Players in Game:
                    </h3>
                    <ul className="list-disc list-inside text-neutral-300">
                        {gamePlayers.map(player => (
                            <li key={player.id}>
                                {player.name}{' '}
                                {player.id === currentSocketId && (
                                    <span className="text-secondary-400 font-semibold">(You)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}; 