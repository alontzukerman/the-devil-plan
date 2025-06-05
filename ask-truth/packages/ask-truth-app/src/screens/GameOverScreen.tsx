import React from 'react';
import { useLocation } from 'react-router-dom';
import { useGameOver } from '../hooks/gameOver/useGameOver';
import { GameOverHeader } from '../components/gameOver/GameOverHeader';
import { GameOverActions } from '../components/gameOver/GameOverActions';
import { GameLayout, Stack } from '@ask-truth/ui';
import type { GameOverLocationState } from '../utils/types/gameOver.types';

const GameOverScreen: React.FC = () => {
    const location = useLocation();
    const { winnerName = 'N/A' } = (location.state as GameOverLocationState) || {};

    const { handlePlayAgain } = useGameOver();

    return (
        <GameLayout backgroundVariant="default">
            <Stack spacing="lg" align="center" justify="center">
                <GameOverHeader winnerName={winnerName} />
                <GameOverActions onPlayAgain={handlePlayAgain} />
            </Stack>
        </GameLayout>
    );
};

export default GameOverScreen; 