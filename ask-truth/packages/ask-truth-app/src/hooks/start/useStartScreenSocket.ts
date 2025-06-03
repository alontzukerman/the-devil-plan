import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type {
    GameCreatedData,
    PlayerJoinedData,
    GameState,
    GameJoinErrorData,
    PlayerLeftData,
    StartScreenState
} from '../../utils/types/startScreen.types';

interface UseStartScreenSocketProps {
    socket: Socket | null;
    setState: React.Dispatch<React.SetStateAction<StartScreenState>>;
}

export const useStartScreenSocket = ({ socket, setState }: UseStartScreenSocketProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) {
            console.log('useStartScreenSocket: No socket available');
            return;
        }

        console.log('useStartScreenSocket: Setting up socket listeners');

        const handleGameCreated = (data: GameCreatedData) => {
            console.log('useStartScreenSocket: Game Created by me:', data);
            setState(prev => ({
                ...prev,
                createdGameId: data.gameId,
                gamePlayers: data.players,
                isWaitingForOpponent: true,
                errorMessage: null
            }));
        };

        const handlePlayerJoined = (data: PlayerJoinedData) => {
            console.log('useStartScreenSocket: Player Joined/Game State Update:', data);
            setState(prev => ({
                ...prev,
                createdGameId: data.gameId,
                gamePlayers: data.players,
                isWaitingForOpponent: data.players.length < 2,
                errorMessage: null
            }));
        };

        const handleNavigateToGameSetup = (data: GameState) => {
            console.log('useStartScreenSocket: Server says: Navigate to game setup', data);
            setState(prev => ({
                ...prev,
                gamePlayers: data.players,
                isWaitingForOpponent: false
            }));

            // Navigate to the card selection screen WITH player data and selfId
            navigate(`/game/${data.gameId}/select-cards`, {
                state: {
                    players: data.players,
                    selfId: socket.id
                }
            });
        };

        const handleGameJoinError = (data: GameJoinErrorData) => {
            console.error('useStartScreenSocket: Game Join Error:', data.message);
            setState(prev => ({
                ...prev,
                errorMessage: data.message
            }));
        };

        const handlePlayerLeft = (data: PlayerLeftData) => {
            console.log('useStartScreenSocket: Player left:', data);
            setState(prev => {
                const updates: Partial<StartScreenState> = {
                    gamePlayers: data.players
                };

                if (data.players.length < 2) {
                    updates.isWaitingForOpponent = true;
                }

                // If the current user was the one who left
                if (socket.id === data.disconnectedPlayerId) {
                    updates.errorMessage = 'You have disconnected from the game.';
                    updates.createdGameId = null;
                    updates.isWaitingForOpponent = false;
                }

                return { ...prev, ...updates };
            });
        };

        // Register socket listeners
        socket.on('gameCreated', handleGameCreated);
        socket.on('playerJoined', handlePlayerJoined);
        socket.on('navigateToGameSetup', handleNavigateToGameSetup);
        socket.on('gameJoinError', handleGameJoinError);
        socket.on('playerLeft', handlePlayerLeft);

        console.log('useStartScreenSocket: All listeners attached');

        return () => {
            console.log('useStartScreenSocket: Cleaning up listeners');
            socket.off('gameCreated', handleGameCreated);
            socket.off('playerJoined', handlePlayerJoined);
            socket.off('navigateToGameSetup', handleNavigateToGameSetup);
            socket.off('gameJoinError', handleGameJoinError);
            socket.off('playerLeft', handlePlayerLeft);
        };
    }, [socket, navigate, setState]);
}; 