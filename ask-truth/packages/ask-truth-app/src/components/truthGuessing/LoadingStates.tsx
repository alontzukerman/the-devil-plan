import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@ask-truth/ui';
import type { LoadingState } from '../../utils/types/truthGuessing.types';

interface LoadingStatesProps {
    loadingState: LoadingState;
    statusMessage: string;
    gameId: string | undefined;
    targetPlayerName: string;
}

export const LoadingStates: React.FC<LoadingStatesProps> = ({
    loadingState,
    statusMessage,
    gameId,
    targetPlayerName
}) => {
    const navigate = useNavigate();

    if (loadingState.isConnecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-400 mb-4">Connecting...</h1>
                <p className="text-gray-300 text-lg">
                    {statusMessage || 'Initializing connection to game server...'}
                </p>
            </div>
        );
    }

    if (!loadingState.hasGameId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-red-500 mb-4">Error</h1>
                <p className="text-gray-300 text-lg">Game ID is missing. Cannot load game.</p>
            </div>
        );
    }

    if (loadingState.isMyTurn && !loadingState.hasTargetPlayer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-300 mb-4">Loading Truth Phase...</h1>
                <p className="text-gray-300 text-lg">
                    Preparing for your guess... {statusMessage}
                </p>
            </div>
        );
    }

    if (!loadingState.isMyTurn && loadingState.hasTargetPlayer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="font-title text-4xl text-yellow-300 mb-6">Truth Phase</h1>
                <p className="text-xl text-gray-200 mb-3">
                    Waiting for <span className="font-semibold text-indigo-300">{targetPlayerName}</span> to make their guess.
                </p>
                <p className="text-gray-400 mb-4">
                    (You are the target. Your series is being guessed!)
                </p>
                <p className="italic text-gray-300">{statusMessage}</p>
                <Button
                    onClick={() => navigate(`/game/${gameId}/bidding`)}
                    variant="secondary"
                    className="mt-8"
                >
                    Return to Game (if stuck)
                </Button>
            </div>
        );
    }

    if (!loadingState.isMyTurn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-300 mb-4">Loading Truth Phase...</h1>
                <p className="text-gray-300 text-lg">
                    {statusMessage || 'Waiting for opponent and game state...'}
                </p>
            </div>
        );
    }

    return null;
}; 