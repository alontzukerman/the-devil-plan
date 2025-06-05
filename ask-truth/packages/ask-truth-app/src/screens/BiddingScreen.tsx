import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { useBiddingSocket } from '../hooks/bidding/useBiddingSocket';
import { useBiddingTimer } from '../hooks/bidding/useBiddingTimer';
import { BiddingStatus } from '../components/bidding/BiddingStatus';
import { ActionChoicePanel } from '../components/bidding/ActionChoicePanel';
import { GameLayout, Panel, Stack, PlayerInfo } from '@ask-truth/ui';
import type { BiddingState } from '../utils/types/bidding.types';

interface BiddingLocationState {
    players?: { id: string; name: string }[];
    selfId?: string;
}

const BiddingScreen: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const socketContext = useContext(SocketContext);
    const socket = socketContext?.socket || null;

    // Combined state
    const [state, setState] = useState<BiddingState>({
        myPlayerName: '',
        opponentPlayerName: '',
        myPlayerId: '',
        myCoins: 10,
        opponentHasFewCoins: false,
        currentBidAmount: 0,
        timeLeft: 10,
        isTimerActive: false,
        hasBidBeenSubmitted: false,
        biddingStatusMessage: 'Waiting for bidding to start...',
        bidOutcome: null,
        canChooseAction: false,
        isOpponentChoosingQuestion: false,
        askedQuestions: []
    });

    // Set player ID from socket
    useEffect(() => {
        if (socket?.id && state.myPlayerId !== socket.id) {
            console.log(`BiddingScreen: Setting myPlayerId to socket.id "${socket.id}"`);
            setState(prev => ({ ...prev, myPlayerId: socket.id || '' }));
        }
    }, [socket, state.myPlayerId]);

    // Handle location state for player names
    useEffect(() => {
        const locationState = location.state as BiddingLocationState | null;
        console.log('BiddingScreen: location.state changed', locationState);

        if (locationState?.players && locationState?.selfId) {
            const self = locationState.players.find(p => p.id === locationState.selfId);
            const opponent = locationState.players.find(p => p.id !== locationState.selfId);

            setState(prev => ({
                ...prev,
                myPlayerName: self?.name || prev.myPlayerName,
                opponentPlayerName: opponent?.name || 'Waiting for opponent...'
            }));
        }
    }, [location.state]);

    // Custom hooks
    useBiddingSocket({ socket, gameId, state, setState });
    useBiddingTimer({
        socket,
        gameId,
        timeLeft: state.timeLeft,
        isTimerActive: state.isTimerActive,
        hasBidBeenSubmitted: state.hasBidBeenSubmitted,
        currentBidAmount: state.currentBidAmount,
        setTimeLeft: (value) => setState(prev => ({
            ...prev,
            timeLeft: typeof value === 'function' ? value(prev.timeLeft) : value
        })),
        setIsTimerActive: (value) => setState(prev => ({ ...prev, isTimerActive: value })),
        setHasBidBeenSubmitted: (value) => setState(prev => ({ ...prev, hasBidBeenSubmitted: value })),
        setBiddingStatusMessage: (message) => setState(prev => ({ ...prev, biddingStatusMessage: message }))
    });

    // Event handlers
    const handleIncreaseBid = () => {
        if (!state.isTimerActive || state.hasBidBeenSubmitted) return;
        if (state.myCoins > state.currentBidAmount) {
            setState(prev => ({ ...prev, currentBidAmount: prev.currentBidAmount + 1 }));
        }
    };

    const handleDecreaseBid = () => {
        if (!state.isTimerActive || state.hasBidBeenSubmitted) return;
        if (state.currentBidAmount > 0) {
            setState(prev => ({ ...prev, currentBidAmount: prev.currentBidAmount - 1 }));
        }
    };

    const handleChooseAction = (action: 'Ask' | 'Truth') => {
        if (!state.canChooseAction || !socket || !gameId) return;

        console.log(`Player chose action: ${action}`);
        socket.emit('playerMadeChoice', { gameId, choice: action });

        setState(prev => ({
            ...prev,
            canChooseAction: false,
            biddingStatusMessage: action === 'Ask'
                ? 'You chose to Ask. Selecting a question...'
                : 'You chose Truth. Preparing to guess...'
        }));
    };

    // Loading state
    if (!socketContext || !socket) {
        return (
            <GameLayout title="Connecting to Bidding..." backgroundVariant="game">
                <p className="tritium-font">{state.biddingStatusMessage}</p>
            </GameLayout>
        );
    }

    return (
        <GameLayout title="Bidding Phase" backgroundVariant="game">
            <Panel variant="game">
                <Stack spacing="lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PlayerInfo
                            playerName={state.myPlayerName}
                            coins={state.myCoins}
                            isCurrentPlayer={true}
                            size="md"
                        />
                        <PlayerInfo
                            playerName={state.opponentPlayerName}
                            hasFewCoins={state.opponentHasFewCoins}
                            isCurrentPlayer={false}
                            size="md"
                        />
                    </div>

                    <BiddingStatus
                        timeLeft={state.timeLeft}
                        isTimerActive={state.isTimerActive}
                        isOpponentChoosingQuestion={state.isOpponentChoosingQuestion}
                        opponentPlayerName={state.opponentPlayerName}
                        bidOutcome={state.bidOutcome}
                        canChooseAction={state.canChooseAction}
                        biddingStatusMessage={state.biddingStatusMessage}
                        currentBidAmount={state.currentBidAmount}
                        myCoins={state.myCoins}
                        hasBidBeenSubmitted={state.hasBidBeenSubmitted}
                        onIncreaseBid={handleIncreaseBid}
                        onDecreaseBid={handleDecreaseBid}
                    />

                    <ActionChoicePanel
                        canChooseAction={state.canChooseAction}
                        onChooseAction={handleChooseAction}
                    />

                    {/* Question History - keeping original implementation for now */}
                    {state.askedQuestions.length > 0 && (
                        <div className="p-4 bg-neutral-600 rounded-lg">
                            <h3 className="text-xl font-semibold text-secondary-300 mb-3">Question History</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {state.askedQuestions.map((q, index) => {
                                    const askerName = q.askedByPlayerId === state.myPlayerId ? "You" : state.opponentPlayerName || "Opponent";
                                    const targetName = q.answeredByPlayerId === state.myPlayerId ? "you" : state.opponentPlayerName || "Opponent";
                                    let answerText = String(q.answer);
                                    if (typeof q.answer === 'boolean') {
                                        answerText = q.answer ? 'TRUE' : 'FALSE';
                                    }
                                    let paramsString = "";
                                    if (q.params?.positions) {
                                        paramsString = ` (Selected positions: ${q.params.positions.map((p: number) => p + 1).join(', ')})`;
                                    }
                                    return (
                                        <div key={index} className="text-sm text-info bg-neutral-500 p-2 rounded">
                                            <strong>Q from {askerName} to {targetName}:</strong> "{q.questionText}"{paramsString}
                                            <br />
                                            <strong>Answer:</strong> {answerText}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Stack>
            </Panel>
        </GameLayout>
    );
};

export default BiddingScreen; 