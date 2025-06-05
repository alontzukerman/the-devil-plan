import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useStartScreenSocket } from '../hooks/start/useStartScreenSocket';
import { ConnectionStatus } from '../components/start/ConnectionStatus';
import { GameCreationForm } from '../components/start/GameCreationForm';
import { GameJoiningForm } from '../components/start/GameJoiningForm';
import { GameStatusDisplay } from '../components/start/GameStatusDisplay';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { GameLayout, Panel, Stack } from '@ask-truth/ui';
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
        <GameLayout title="Ask or Truth" backgroundVariant="dark">
            <Stack spacing="lg" align="center">
                <ConnectionStatus isConnected={isConnected} />

                {showInitialForms && (
                    <Panel variant="dark" className="w-full max-w-md">
                        <Stack spacing="lg">
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
                        </Stack>
                    </Panel>
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
            </Stack>
        </GameLayout>
    );
};

export default StartScreen; 