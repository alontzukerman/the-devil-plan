import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useStartScreenSocket } from '../hooks/start/useStartScreenSocket';
import { GameHeader } from '../components/shared/GameHeader';
import { ConnectionStatus } from '../components/start/ConnectionStatus';
import { GameCreationForm } from '../components/start/GameCreationForm';
import { GameJoiningForm } from '../components/start/GameJoiningForm';
import { GameStatusDisplay } from '../components/start/GameStatusDisplay';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import type { StartScreenState } from '../utils/types/startScreen.types';

const StartScreen: React.FC = () => {
    const { socket, isConnected } = useSocket();

    // Combined state
    const [state, setState] = useState<StartScreenState>({
        playerName: '',
        gameIdToJoin: '',
        createdGameId: null,
        isWaitingForOpponent: false,
        errorMessage: null,
        gamePlayers: []
    });

    // Custom hook for socket handling
    useStartScreenSocket({ socket, setState });

    // Event handlers
    const handleCreateGame = () => {
        if (socket && state.playerName.trim()) {
            console.log('Attempting to create game with player:', state.playerName);
            socket.emit('createGame', { playerName: state.playerName.trim() });
        }
    };

    const handleJoinGame = () => {
        if (socket && state.playerName.trim() && state.gameIdToJoin.trim()) {
            console.log('Attempting to join game:', state.gameIdToJoin, 'as player:', state.playerName);
            socket.emit('joinGame', {
                gameId: state.gameIdToJoin.trim(),
                playerName: state.playerName.trim()
            });
        }
    };

    const handlePlayerNameChange = (name: string) => {
        setState(prev => ({ ...prev, playerName: name }));
    };

    const handleGameIdChange = (gameId: string) => {
        setState(prev => ({ ...prev, gameIdToJoin: gameId }));
    };

    // Determine what to show
    const showInitialForms = isConnected &&
        !state.createdGameId &&
        !state.isWaitingForOpponent &&
        state.gamePlayers.length === 0;

    const showGameStatus = (state.createdGameId ||
        state.isWaitingForOpponent ||
        state.gamePlayers.length > 0) &&
        !state.errorMessage;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <GameHeader
                title="Ask or Truth"
                className="font-title text-5xl text-yellow-400 mb-12 text-center"
            />

            <ConnectionStatus isConnected={isConnected} />

            {showInitialForms && (
                <div className="bg-gray-700 bg-opacity-50 p-8 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm">
                    <GameCreationForm
                        playerName={state.playerName}
                        isConnected={isConnected}
                        onPlayerNameChange={handlePlayerNameChange}
                        onCreateGame={handleCreateGame}
                    />

                    <GameJoiningForm
                        playerName={state.playerName}
                        gameIdToJoin={state.gameIdToJoin}
                        isConnected={isConnected}
                        onGameIdChange={handleGameIdChange}
                        onJoinGame={handleJoinGame}
                    />
                </div>
            )}

            {showGameStatus && (
                <GameStatusDisplay
                    createdGameId={state.createdGameId}
                    isWaitingForOpponent={state.isWaitingForOpponent}
                    gamePlayers={state.gamePlayers}
                    currentSocketId={socket?.id}
                />
            )}

            <ErrorMessage message={state.errorMessage} />
        </div>
    );
};

export default StartScreen; 