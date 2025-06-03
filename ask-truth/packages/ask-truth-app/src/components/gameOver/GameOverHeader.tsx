import React from 'react';
import type { GameOverHeaderProps } from '../../utils/types/gameOver.types';

export const GameOverHeader: React.FC<GameOverHeaderProps> = ({ winnerName }) => {
    return (
        <header className="text-center mb-10">
            <h1 className="font-title text-5xl sm:text-6xl text-yellow-400 mb-8">
                Game Over!
            </h1>
            <p className="text-3xl sm:text-4xl text-gray-200">
                Winner: <span className="font-semibold text-green-300">{winnerName}</span>
            </p>
        </header>
    );
}; 