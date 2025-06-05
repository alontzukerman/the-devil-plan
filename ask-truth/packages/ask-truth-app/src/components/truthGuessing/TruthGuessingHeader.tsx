import React from 'react';
import { GameStatus } from '@ask-truth/ui';

interface TruthGuessingHeaderProps {
    targetPlayerName: string;
    statusMessage: string;
}

export const TruthGuessingHeader: React.FC<TruthGuessingHeaderProps> = ({
    targetPlayerName,
    statusMessage
}) => {
    return (
        <header className="text-center mb-6">
            <h1 className="font-title text-4xl sm:text-5xl text-secondary-400 mb-3">
                Truth Phase
            </h1>
            <p className="text-lg mb-5 text-gray-300">
                Guess <span className="font-semibold text-indigo-300">{targetPlayerName || 'Opponent'}</span>'s Secret Series
            </p>
            <GameStatus
                message={statusMessage}
                type="info"
                size="sm"
            />
        </header>
    );
}; 