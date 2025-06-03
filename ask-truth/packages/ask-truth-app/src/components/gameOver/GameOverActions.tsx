import React from 'react';
import { Button } from '@ask-truth/ui';
import type { GameOverActionsProps } from '../../utils/types/gameOver.types';

export const GameOverActions: React.FC<GameOverActionsProps> = ({ onPlayAgain }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            <Button
                onClick={onPlayAgain}
                size="xl"
                className="px-10 py-4 text-2xl"
            >
                Play Again
            </Button>
            {/* Future: Add more actions like "View Stats", "Share Results", etc. */}
        </div>
    );
}; 