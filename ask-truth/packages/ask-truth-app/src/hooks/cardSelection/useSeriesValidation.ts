import { useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { isSeriesValid } from '../../utils/cardUtils';
import type { CardSelectionState } from '../../utils/types/cardSelection.types';

interface UseSeriesValidationProps {
    socket: Socket | null;
    gameId: string | undefined;
    state: CardSelectionState;
    setState: React.Dispatch<React.SetStateAction<CardSelectionState>>;
}

export const useSeriesValidation = ({
    socket,
    gameId,
    state,
    setState
}: UseSeriesValidationProps) => {
    const handleConfirmSelection = useCallback(() => {
        if (state.selectedSeries.length !== 8) {
            setState(prev => ({
                ...prev,
                statusMessage: 'Please select exactly 8 cards for your series.'
            }));
            return;
        }

        if (!isSeriesValid(state.selectedSeries)) {
            setState(prev => ({
                ...prev,
                statusMessage: 'Invalid series: Cards of the same suit must be in ascending order (Aces low). Please correct your series.'
            }));
            return;
        }

        // If valid and all checks pass:
        setState(prev => ({
            ...prev,
            hasConfirmedSelection: true,
            statusMessage: 'Your series is confirmed! Waiting for opponent...'
        }));

        if (socket && gameId) {
            console.log('useSeriesValidation: Emitting playerSelectedSeries with:', { gameId, series: state.selectedSeries });
            socket.emit('playerSelectedSeries', { gameId, series: state.selectedSeries });
        }
    }, [state.selectedSeries, gameId, socket, setState]);

    const canConfirm = state.selectedSeries.length === 8 && !state.hasConfirmedSelection;
    const canReset = !state.hasConfirmedSelection && state.selectedSeries.length > 0;

    return {
        handleConfirmSelection,
        canConfirm,
        canReset
    };
}; 