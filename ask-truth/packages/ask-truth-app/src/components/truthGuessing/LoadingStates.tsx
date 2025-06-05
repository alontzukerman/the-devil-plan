import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, GameStatus } from '@ask-truth/ui';
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
                <h1 className="font-title text-4xl text-secondary-400 mb-4">Connecting...</h1>
                <GameStatus
                    message={statusMessage || 'Initializing connection to game server...'}
                    type="waiting"
                    showSpinner={true}
                    size="lg"
                />
            </div>
        );
    }

    if (!loadingState.hasGameId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-error mb-4">Error</h1>
                <GameStatus
                    message="Game ID is missing. Cannot load game."
                    type="error"
                    size="lg"
                />
            </div>
        );
    }

    if (loadingState.isMyTurn && !loadingState.hasTargetPlayer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-secondary-300 mb-4">Loading Truth Phase...</h1>
                <GameStatus
                    message={`Preparing for your guess... ${statusMessage}`}
                    type="waiting"
                    showSpinner={true}
                    size="lg"
                />
            </div>
        );
    }

    if (!loadingState.isMyTurn && loadingState.hasTargetPlayer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="font-title text-4xl text-secondary-300 mb-6">Truth Phase</h1>
                <p className="text-xl text-neutral-200 mb-3">
                    Waiting for <span className="font-semibold text-primary-300">{targetPlayerName}</span> to make their guess.
                </p>
                <p className="text-neutral-400 mb-4">
                    (You are the target. Your series is being guessed!)
                </p>
                <p className="italic text-neutral-300">{statusMessage}</p>
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
                <h1 className="font-title text-4xl text-secondary-300 mb-4">Loading Truth Phase...</h1>
                <p className="text-neutral-300 text-lg">
                    {statusMessage || 'Waiting for opponent and game state...'}
                </p>
            </div>
        );
    }

    return null;
}; 