import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type {
    OpponentConfirmedData,
    NavigateToBiddingData,
    PlayerDetailsData,
    CardSelectionState
} from '../../utils/types/cardSelection.types';

interface UseCardSelectionSocketProps {
    socket: Socket | null;
    gameId: string | undefined;
    isConnected: boolean;
    hasConfirmedSelection: boolean;
    setState: React.Dispatch<React.SetStateAction<CardSelectionState>>;
}

export const useCardSelectionSocket = ({
    socket,
    gameId,
    isConnected,
    hasConfirmedSelection,
    setState
}: UseCardSelectionSocketProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!gameId) {
            console.error('No game ID found, redirecting to start.');
            navigate('/');
            return;
        }

        console.log(`useCardSelectionSocket: Card Selection for Game ID: ${gameId}, Socket Connected: ${isConnected}, Socket ID: ${socket?.id}`);

        if (!socket) {
            console.log('useCardSelectionSocket: No socket available');
            return;
        }

        console.log('useCardSelectionSocket: Setting up socket listeners');

        const handleOpponentConfirmed = (data: OpponentConfirmedData) => {
            console.log('useCardSelectionSocket: Opponent confirmed', data);
            const name = data.opponentName || 'Opponent';

            setState(prev => ({
                ...prev,
                opponentHasConfirmed: true,
                opponentPlayerName: name,
                statusMessage: prev.hasConfirmedSelection
                    ? `${name} has also confirmed. Both ready!`
                    : `${name} has confirmed their series. Please confirm yours.`
            }));
        };

        const handleNavigateToBidding = (data: NavigateToBiddingData) => {
            console.log('useCardSelectionSocket: Navigate to bidding', data);
            setState(prev => ({
                ...prev,
                statusMessage: 'Both players confirmed! Navigating to bidding...'
            }));

            // Small delay to allow user to read message before navigating
            setTimeout(() => {
                navigate(data.nextScreen);
            }, 2000);
        };

        const handlePlayerDetails = (data: PlayerDetailsData) => {
            console.log('useCardSelectionSocket: Player details received', data);
            setState(prev => ({
                ...prev,
                currentPlayerName: data.currentPlayerName,
                opponentPlayerName: data.opponentPlayerName
            }));
        };

        // Register socket listeners
        socket.on('opponentSeriesConfirmed', handleOpponentConfirmed);
        socket.on('allReadyNavigateToBidding', handleNavigateToBidding);
        socket.on('updatePlayerNames', handlePlayerDetails);

        console.log('useCardSelectionSocket: All listeners attached');

        return () => {
            console.log('useCardSelectionSocket: Cleaning up listeners');
            socket.off('opponentSeriesConfirmed', handleOpponentConfirmed);
            socket.off('allReadyNavigateToBidding', handleNavigateToBidding);
            socket.off('updatePlayerNames', handlePlayerDetails);
        };
    }, [gameId, navigate, isConnected, socket, hasConfirmedSelection, setState]);
}; 