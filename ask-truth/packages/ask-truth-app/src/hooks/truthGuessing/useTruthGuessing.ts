import { useCallback } from 'react';
import type { Card } from '../../utils/cardUtils';
import type { TruthGuessingState } from '../../utils/types/truthGuessing.types';

interface UseTruthGuessingProps {
    state: TruthGuessingState;
    setState: React.Dispatch<React.SetStateAction<TruthGuessingState>>;
}

export const useTruthGuessing = ({ state, setState }: UseTruthGuessingProps) => {
    const handleSelectFromDeck = useCallback((card: Card) => {
        if (state.isGuessConfirmed ||
            state.guessedSeries.length >= 8 ||
            state.guessedSeries.find(c => c.id === card.id) ||
            !state.isMyTurnToGuess) return;

        setState(prev => ({
            ...prev,
            guessedSeries: [...prev.guessedSeries, card]
        }));
    }, [state.isGuessConfirmed, state.guessedSeries, state.isMyTurnToGuess, setState]);

    const handleDeselectFromGuessedSeries = useCallback((cardToRemove: Card) => {
        if (state.isGuessConfirmed || !state.isMyTurnToGuess) return;

        setState(prev => ({
            ...prev,
            guessedSeries: prev.guessedSeries.filter(card => card.id !== cardToRemove.id)
        }));
    }, [state.isGuessConfirmed, state.isMyTurnToGuess, setState]);

    const handleResetGuess = useCallback(() => {
        if (state.isGuessConfirmed || !state.isMyTurnToGuess) return;

        setState(prev => ({
            ...prev,
            guessedSeries: [],
            statusMessage: `Attempt to reconstruct ${prev.targetPlayerName || 'opponent'}'s 8-card secret series.`
        }));
    }, [state.isGuessConfirmed, state.isMyTurnToGuess, setState]);

    return {
        handleSelectFromDeck,
        handleDeselectFromGuessedSeries,
        handleResetGuess
    };
}; 