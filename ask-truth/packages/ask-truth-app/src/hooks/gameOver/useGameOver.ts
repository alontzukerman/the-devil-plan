import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGameOver = () => {
    const navigate = useNavigate();

    const handlePlayAgain = useCallback(() => {
        // Navigate to start screen, clearing game state or letting server handle new game setup
        navigate('/');
    }, [navigate]);

    return {
        handlePlayAgain
    };
}; 