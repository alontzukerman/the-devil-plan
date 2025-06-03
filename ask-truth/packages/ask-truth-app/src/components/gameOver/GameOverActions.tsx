import React from 'react';
import type { GameOverActionsProps } from '../../utils/types/gameOver.types';

export const GameOverActions: React.FC<GameOverActionsProps> = ({ onPlayAgain }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            <button
                onClick={onPlayAgain}
                className="btn btn-primary px-10 py-4 text-2xl"
            >
                Play Again
            </button>
            {/* Future: Add more actions like "View Stats", "Share Results", etc. */}
        </div>
    );
}; 