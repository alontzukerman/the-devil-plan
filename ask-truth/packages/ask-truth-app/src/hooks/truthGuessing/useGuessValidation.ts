import { useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { TruthGuessingState } from '../../utils/types/truthGuessing.types';

interface UseGuessValidationProps {
    socket: Socket | null;
    gameId: string | undefined;
    state: TruthGuessingState;
    setState: React.Dispatch<React.SetStateAction<TruthGuessingState>>;
}

export const useGuessValidation = ({
    socket,
    gameId,
    state,
    setState
}: UseGuessValidationProps) => {
    const handleConfirmGuess = useCallback(() => {
        if (!socket ||
            state.guessedSeries.length !== 8 ||
            state.isGuessConfirmed ||
            !state.isMyTurnToGuess) return;

        console.log('useGuessValidation: Confirming guess for game:', gameId, 'Guess:', state.guessedSeries);

        const seriesToSend = state.guessedSeries.map(({ suit, rank }) => ({
            suit: String(suit),
            rank: Number(rank)
        }));

        socket.emit('submitTruthGuess', { gameId, guess: seriesToSend });

        setState(prev => ({
            ...prev,
            isGuessConfirmed: true,
            statusMessage: 'Your guess has been submitted. Waiting for the result...'
        }));
    }, [socket, gameId, state.guessedSeries, state.isGuessConfirmed, state.isMyTurnToGuess, setState]);

    const canConfirm = state.guessedSeries.length === 8 &&
        !state.isGuessConfirmed &&
        state.isMyTurnToGuess;

    const canReset = state.guessedSeries.length > 0 &&
        !state.isGuessConfirmed &&
        state.isMyTurnToGuess;

    return {
        handleConfirmGuess,
        canConfirm,
        canReset
    };
}; 