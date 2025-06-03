import { useCallback } from 'react';
import type { Card } from '../../utils/cardUtils';
import type { CardSelectionState } from '../../utils/types/cardSelection.types';

interface UseCardSelectionProps {
    state: CardSelectionState;
    setState: React.Dispatch<React.SetStateAction<CardSelectionState>>;
}

export const useCardSelection = ({ state, setState }: UseCardSelectionProps) => {
    const handleSelectFromDeck = useCallback((cardToSelect: Card) => {
        if (state.hasConfirmedSelection) return; // Don't allow changes after confirmation
        if (state.selectedSeries.length < 8 && !state.selectedSeries.find(card => card.id === cardToSelect.id)) {
            setState(prev => ({
                ...prev,
                selectedSeries: [...prev.selectedSeries, cardToSelect]
            }));
        }
    }, [state.selectedSeries, state.hasConfirmedSelection, setState]);

    const handleDeselectFromSeries = useCallback((cardToDeselect: Card) => {
        if (state.hasConfirmedSelection) return; // Don't allow changes after confirmation
        setState(prev => ({
            ...prev,
            selectedSeries: prev.selectedSeries.filter(card => card.id !== cardToDeselect.id)
        }));
    }, [state.hasConfirmedSelection, setState]);

    const handleResetSelection = useCallback(() => {
        if (state.hasConfirmedSelection) return; // Cannot reset after confirmation
        setState(prev => ({
            ...prev,
            selectedSeries: [],
            statusMessage: 'Selection reset. Select your 8-card secret series again.'
        }));
    }, [state.hasConfirmedSelection, setState]);

    return {
        handleSelectFromDeck,
        handleDeselectFromSeries,
        handleResetSelection
    };
}; 