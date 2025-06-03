import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { generateDeck } from '../utils/cardUtils';
import { useCardSelectionSocket } from '../hooks/cardSelection/useCardSelectionSocket';
import { useCardSelection } from '../hooks/cardSelection/useCardSelection';
import { useSeriesValidation } from '../hooks/cardSelection/useSeriesValidation';
import { CardSelectionHeader } from '../components/cardSelection/CardSelectionHeader';
import { SelectedSeries } from '../components/cardSelection/SelectedSeries';
import { SeriesCounter } from '../components/cardSelection/SeriesCounter';
import { CardDeck } from '../components/cardSelection/CardDeck';
import { SelectionControls } from '../components/cardSelection/SelectionControls';
import { SelectionStatus } from '../components/cardSelection/SelectionStatus';
import type {
    CardSelectionLocationState,
    CardSelectionState,
    Player
} from '../utils/types/cardSelection.types';

const CardSelectionScreen: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const { socket, isConnected } = useSocket();

    const deck = generateDeck();

    // Combined state
    const [state, setState] = useState<CardSelectionState>({
        selectedSeries: [],
        hasConfirmedSelection: false,
        opponentHasConfirmed: false,
        statusMessage: 'Select your 8-card secret series.',
        currentPlayerName: 'Player 1',
        opponentPlayerName: 'Player 2'
    });

    // Handle route state for player names
    useEffect(() => {
        const routeState = location.state as CardSelectionLocationState;
        if (routeState?.players && routeState?.selfId) {
            const self = routeState.players.find((p: Player) => p.id === routeState.selfId);
            const opponent = routeState.players.find((p: Player) => p.id !== routeState.selfId);

            setState(prev => ({
                ...prev,
                currentPlayerName: self?.name || prev.currentPlayerName,
                opponentPlayerName: opponent?.name ||
                    (routeState.players && routeState.players.length === 1 ? 'Waiting for opponent...' : prev.opponentPlayerName)
            }));
        } else {
            console.log('CardSelectionScreen: No route state found for player names, relying on socket or placeholders.');
        }
    }, [location.state]);

    // Custom hooks
    useCardSelectionSocket({
        socket,
        gameId,
        isConnected,
        hasConfirmedSelection: state.hasConfirmedSelection,
        setState
    });

    const {
        handleSelectFromDeck,
        handleDeselectFromSeries,
        handleResetSelection
    } = useCardSelection({ state, setState });

    const {
        handleConfirmSelection,
        canConfirm,
        canReset
    } = useSeriesValidation({ socket, gameId, state, setState });

    return (
        <div className="flex flex-col items-center p-4 pb-8 min-h-screen">
            <CardSelectionHeader
                gameId={gameId}
                currentPlayerName={state.currentPlayerName}
                statusMessage={state.statusMessage}
            />

            <SelectedSeries
                selectedSeries={state.selectedSeries}
                onDeselectCard={handleDeselectFromSeries}
            />

            <SeriesCounter
                selectedCount={state.selectedSeries.length}
                maxCount={8}
            />

            <CardDeck
                deck={deck}
                selectedSeries={state.selectedSeries}
                hasConfirmedSelection={state.hasConfirmedSelection}
                onSelectCard={handleSelectFromDeck}
            />

            <SelectionControls
                canConfirm={canConfirm}
                canReset={canReset}
                onConfirm={handleConfirmSelection}
                onReset={handleResetSelection}
            />

            <SelectionStatus
                hasConfirmedSelection={state.hasConfirmedSelection}
                opponentHasConfirmed={state.opponentHasConfirmed}
                opponentPlayerName={state.opponentPlayerName}
            />
        </div>
    );
};

export default CardSelectionScreen; 