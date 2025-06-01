import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GameOverScreen: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { winnerName } = location.state || { winnerName: 'N/A' }; // Default if state is not passed

    const handlePlayAgain = () => {
        // Navigate to start screen, clearing game state or letting server handle new game setup
        navigate('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="font-title text-5xl sm:text-6xl text-yellow-400 mb-8 text-center">
                Game Over!
            </h1>
            <p className="text-3xl sm:text-4xl mb-10 text-center text-gray-200">
                Winner: <span className="font-semibold text-green-300">{winnerName}</span>
            </p>
            <button
                onClick={handlePlayAgain}
                className="btn btn-primary px-10 py-4 text-2xl"
            >
                Play Again
            </button>
        </div>
    );
};

export default GameOverScreen; 