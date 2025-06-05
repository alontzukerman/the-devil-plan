import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { generateDeck } from '../utils/cardUtils';
import { useTruthGuessingSocket } from '../hooks/truthGuessing/useTruthGuessingSocket';
import { useTruthGuessing } from '../hooks/truthGuessing/useTruthGuessing';
import { useGuessValidation } from '../hooks/truthGuessing/useGuessValidation';
import { TruthGuessingHeader } from '../components/truthGuessing/TruthGuessingHeader';
import { GuessedSeries } from '../components/truthGuessing/GuessedSeries';
import { GuessControls } from '../components/truthGuessing/GuessControls';
import { LoadingStates } from '../components/truthGuessing/LoadingStates';
import { CardDeck } from '../components/shared/CardDeck';
import { GameLayout, Stack } from '@ask-truth/ui';
import type {
    TruthGuessingLocationState,
    TruthGuessingState,
    LoadingState
} from '../utils/types/truthGuessing.types';

const TruthGuessingScreen: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const { socket } = useSocket();

    const deck = generateDeck();

    // Combined state
    const [state, setState] = useState<TruthGuessingState>({
        targetPlayerName: '',
        guessedSeries: [],
        statusMessage: "Attempt to reconstruct your opponent's 8-card series.",
        isGuessConfirmed: false,
        isMyTurnToGuess: false
    });

    // Handle route state and initial setup
    useEffect(() => {
        const routeState = location.state as TruthGuessingLocationState | null;
        console.log('TruthGuessingScreen location.state:', routeState);

        if (routeState?.opponentPlayerName && routeState?.myPlayerId) {
            setState(prev => ({
                ...prev,
                targetPlayerName: routeState.opponentPlayerName || '',
                statusMessage: `You chose TRUTH. Attempt to reconstruct ${routeState.opponentPlayerName}'s 8-card secret series.`,
                isMyTurnToGuess: socket?.id === routeState.myPlayerId
            }));

            console.log('TruthGuessingScreen: It', socket?.id === routeState.myPlayerId ? 'IS' : 'is NOT', 'my turn to guess.');
        } else if (!socket) {
            setState(prev => ({
                ...prev,
                statusMessage: 'Connecting to server...'
            }));
        } else {
            setState(prev => ({
                ...prev,
                statusMessage: 'Waiting for game information from Bidding Screen...'
            }));
            console.log('TruthGuessingScreen: Missing opponentPlayerName or myPlayerId in location.state');
        }
    }, [location.state, socket, gameId]);

    // Custom hooks
    useTruthGuessingSocket({
        socket,
        gameId,
        targetPlayerName: state.targetPlayerName,
        setState
    });

    const {
        handleSelectFromDeck,
        handleDeselectFromGuessedSeries,
        handleResetGuess
    } = useTruthGuessing({ state, setState });

    const {
        handleConfirmGuess,
        canConfirm,
        canReset
    } = useGuessValidation({ socket, gameId, state, setState });

    // Determine loading state
    const loadingState: LoadingState = {
        isConnecting: !socket,
        hasGameId: !!gameId,
        hasTargetPlayer: !!state.targetPlayerName,
        isMyTurn: state.isMyTurnToGuess
    };

    // Show loading states if needed
    const loadingComponent = (
        <LoadingStates
            loadingState={loadingState}
            statusMessage={state.statusMessage}
            gameId={gameId}
            targetPlayerName={state.targetPlayerName}
        />
    );

    if (loadingComponent && (
        loadingState.isConnecting ||
        !loadingState.hasGameId ||
        (loadingState.isMyTurn && !loadingState.hasTargetPlayer) ||
        (!loadingState.isMyTurn && loadingState.hasTargetPlayer) ||
        !loadingState.isMyTurn
    )) {
        return loadingComponent;
    }

    // Main Guessing UI (My Turn)
    return (
        <GameLayout backgroundVariant="default" className="pt-6 sm:pt-8">
            <Stack spacing="lg" align="center">
                <TruthGuessingHeader
                    targetPlayerName={state.targetPlayerName}
                    statusMessage={state.statusMessage}
                />

                <GuessedSeries
                    guessedSeries={state.guessedSeries}
                    isGuessConfirmed={state.isGuessConfirmed}
                    onDeselectCard={handleDeselectFromGuessedSeries}
                />

                <GuessControls
                    canConfirm={canConfirm}
                    canReset={canReset}
                    onConfirm={handleConfirmGuess}
                    onReset={handleResetGuess}
                />

                <CardDeck
                    deck={deck}
                    selectedCards={state.guessedSeries}
                    onSelectCard={handleSelectFromDeck}
                    isDisabled={state.isGuessConfirmed}
                    title="Available Cards to Choose From"
                    layout="flat"
                    maxSelection={8}
                />
            </Stack>
        </GameLayout>
    );
};

export default TruthGuessingScreen; 