import React from 'react';
import { useLocation } from 'react-router-dom';
import { useGameOver } from '../hooks/gameOver/useGameOver';
import { GameOverHeader } from '../components/gameOver/GameOverHeader';
import { GameOverActions } from '../components/gameOver/GameOverActions';
import type { GameOverLocationState } from '../utils/types/gameOver.types';

const GameOverScreen: React.FC = () => {
    const location = useLocation();
    const { winnerName = 'N/A' } = (location.state as GameOverLocationState) || {};

    const { handlePlayAgain } = useGameOver();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <GameOverHeader winnerName={winnerName} />
            <GameOverActions onPlayAgain={handlePlayAgain} />
        </div>
    );
};

export default GameOverScreen; 