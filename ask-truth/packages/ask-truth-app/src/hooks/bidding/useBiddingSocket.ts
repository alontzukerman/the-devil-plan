import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type {
    BiddingPhaseData,
    BiddingResolvedData,
    NavigateToTruthGuessPayload,
    OpponentIsGuessingPayload,
    BiddingState
} from '../../utils/types/bidding.types';
import type { ClientAskedQuestionInfo } from '../../utils/questions';

interface UseBiddingSocketProps {
    socket: Socket | null;
    gameId: string | undefined;
    state: BiddingState;
    setState: React.Dispatch<React.SetStateAction<BiddingState>>;
}

export const useBiddingSocket = ({ socket, gameId, state, setState }: UseBiddingSocketProps) => {
    const navigate = useNavigate();

    // Refs to avoid stale closures
    const myPlayerNameRef = useRef(state.myPlayerName);
    const opponentPlayerNameRef = useRef(state.opponentPlayerName);
    const bidOutcomeRef = useRef(state.bidOutcome);

    useEffect(() => {
        myPlayerNameRef.current = state.myPlayerName;
    }, [state.myPlayerName]);

    useEffect(() => {
        opponentPlayerNameRef.current = state.opponentPlayerName;
    }, [state.opponentPlayerName]);

    useEffect(() => {
        bidOutcomeRef.current = state.bidOutcome;
    }, [state.bidOutcome]);

    useEffect(() => {
        if (!socket || !gameId || !state.myPlayerId) {
            console.log('useBiddingSocket: Aborting listener setup (missing dependencies)');
            return;
        }

        console.log('useBiddingSocket: Setting up socket listeners');

        const handleBiddingPhaseState = (data: BiddingPhaseData) => {
            console.log('useBiddingSocket: biddingPhaseState received', data);
            if (data.gameId === gameId) {
                setState(prev => ({
                    ...prev,
                    myPlayerName: data.myPlayerName,
                    myPlayerId: data.myPlayerId,
                    myCoins: data.myInitialCoins,
                    opponentPlayerName: data.opponentName,
                    opponentHasFewCoins: data.opponentLowCoins,
                    timeLeft: data.timerDuration,
                    isTimerActive: true,
                    hasBidBeenSubmitted: false,
                    currentBidAmount: 0,
                    bidOutcome: null,
                    canChooseAction: false,
                    isOpponentChoosingQuestion: false,
                    askedQuestions: data.askedQuestionsHistory || prev.askedQuestions,
                    biddingStatusMessage: `Bidding started! You have ${data.myInitialCoins} coins. Time left: ${data.timerDuration}s`
                }));
            }
        };

        const handleBiddingResolved = (data: BiddingResolvedData) => {
            console.log('useBiddingSocket: biddingResolved received', data);
            setState(prev => {
                const isWinner = data.winnerId === prev.myPlayerId;
                let statusMessage = '';

                if (data.bidsTied) {
                    statusMessage = 'Bids were tied! Starting a new bidding round shortly...';
                } else if (data.winnerId) {
                    statusMessage = isWinner
                        ? `You won the bid! Choose an action.`
                        : `${data.winnerName} won the bid. Waiting for them to choose an action...`;
                } else {
                    statusMessage = 'Bidding ended. No winner determined. A new round will start.';
                }

                return {
                    ...prev,
                    isTimerActive: false,
                    myCoins: data.yourNewCoinTotal,
                    opponentHasFewCoins: data.opponentNewLowCoinsStatus,
                    hasBidBeenSubmitted: true,
                    isOpponentChoosingQuestion: false,
                    bidOutcome: data.bidsTied
                        ? { bidsTied: true }
                        : { winnerName: data.winnerName },
                    canChooseAction: isWinner && !data.bidsTied,
                    biddingStatusMessage: statusMessage
                };
            });
        };

        const handleEnableActionChoice = (data: { gameId: string }) => {
            console.log('useBiddingSocket: enableActionChoice received', data);
            if (data.gameId === gameId &&
                bidOutcomeRef.current?.winnerName === myPlayerNameRef.current &&
                !bidOutcomeRef.current?.bidsTied) {
                setState(prev => ({
                    ...prev,
                    canChooseAction: true,
                    isOpponentChoosingQuestion: false,
                    biddingStatusMessage: 'You won the bid! Please choose Ask or Truth.'
                }));
            }
        };

        const handleNavigateToTruthGuess = (data: NavigateToTruthGuessPayload) => {
            console.log('useBiddingSocket: navigateToTruthGuess received', data);
            if (data.gameId === gameId && data.guesserId === state.myPlayerId) {
                setState(prev => ({ ...prev, isTimerActive: false }));
                navigate(`/game/${gameId}/guess-truth`, {
                    state: {
                        gameId: data.gameId,
                        myPlayerId: data.guesserId,
                        myName: data.guesserName,
                        opponentPlayerId: data.targetId,
                        opponentPlayerName: data.targetName
                    }
                });
            }
        };

        const handleOpponentIsGuessing = (data: OpponentIsGuessingPayload) => {
            console.log('useBiddingSocket: opponentIsGuessing received', data);
            if (data.gameId === gameId && data.guesserId !== state.myPlayerId) {
                setState(prev => ({
                    ...prev,
                    biddingStatusMessage: `${data.guesserName} chose TRUTH and is now attempting to guess your secret series... Please wait.`,
                    canChooseAction: false,
                    bidOutcome: null
                }));
            }
        };

        const handleNavigateToQuestionSelection = (data: { gameId: string; chooserName?: string }) => {
            console.log('useBiddingSocket: navigateToQuestionSelection received', data);
            if (data.gameId === gameId && data.chooserName === myPlayerNameRef.current) {
                setState(prev => ({ ...prev, isTimerActive: false }));
                navigate(`/game/${gameId}/select-question`);
            }
        };

        const handleOpponentChoosingQuestion = (data: { gameId: string; chooserName?: string }) => {
            console.log('useBiddingSocket: opponentChoosingQuestion received', data);
            if (data.gameId === gameId && data.chooserName !== myPlayerNameRef.current) {
                const chooserDisplayName = data.chooserName || 'Opponent';
                setState(prev => ({
                    ...prev,
                    biddingStatusMessage: `${chooserDisplayName} chose to ASK and is now selecting a question... Please wait.`,
                    canChooseAction: false,
                    isOpponentChoosingQuestion: true,
                    bidOutcome: null
                }));
            }
        };

        const handleQuestionAnswered = (data: ClientAskedQuestionInfo & { gameId: string }) => {
            console.log('useBiddingSocket: questionAnswered received', data);
            if (data.gameId !== gameId) return;

            setState(prev => {
                // Check if question already exists to avoid duplicates
                const exists = prev.askedQuestions.find(q =>
                    q.questionId === data.questionId &&
                    q.askedByPlayerId === data.askedByPlayerId &&
                    JSON.stringify(q.params) === JSON.stringify(data.params)
                );

                if (exists) return prev;

                const displayAskerName = data.askedByPlayerId === prev.myPlayerId ? "You" : prev.opponentPlayerName || "Opponent";
                const displayTargetName = data.answeredByPlayerId === prev.myPlayerId ? "you" : prev.opponentPlayerName || "Opponent";

                let answerText = String(data.answer);
                if (typeof data.answer === 'boolean') {
                    answerText = data.answer ? 'TRUE' : 'FALSE';
                }

                let paramsString = "";
                if (data.params?.positions) {
                    paramsString = ` (Selected positions: ${data.params.positions.map((p: number) => p + 1).join(', ')})`;
                }

                return {
                    ...prev,
                    askedQuestions: [...prev.askedQuestions, data],
                    isOpponentChoosingQuestion: false,
                    canChooseAction: false,
                    biddingStatusMessage: `Q from ${displayAskerName} to ${displayTargetName}: "${data.questionText}"${paramsString} | Answer: ${answerText}. Next round starting...`
                };
            });
        };

        const handleTruthGuessOutcome = (data: { gameId: string; wasGuessCorrect: boolean; winnerId?: string; winnerName?: string }) => {
            console.log('useBiddingSocket: truthGuessResult received', data);
            if (data.gameId === gameId) {
                if (data.wasGuessCorrect) {
                    setState(prev => ({
                        ...prev,
                        isTimerActive: false,
                        biddingStatusMessage: `${data.winnerName} correctly guessed the series! Game Over.`
                    }));
                    setTimeout(() => {
                        navigate(`/game/${gameId}/game-over`, { state: { winnerName: data.winnerName } });
                    }, 3000);
                } else {
                    setState(prev => ({
                        ...prev,
                        biddingStatusMessage: 'Opponent made an incorrect guess. A new bidding round will start.'
                    }));
                }
            }
        };

        const handleBiddingCancelledOpponentLeft = (data: { message: string }) => {
            console.log('useBiddingSocket: biddingCancelledOpponentLeft received', data);
            setState(prev => ({
                ...prev,
                biddingStatusMessage: data.message || 'Opponent left during bidding. Round cancelled.',
                isTimerActive: false,
                canChooseAction: false,
                bidOutcome: null
            }));
        };

        const handleUpdatePlayerNames = (data: { currentPlayerName: string; opponentPlayerName: string }) => {
            console.log('useBiddingSocket: updatePlayerNames received', data);
            setState(prev => ({
                ...prev,
                myPlayerName: data.currentPlayerName,
                opponentPlayerName: data.opponentPlayerName
            }));
        };

        const handleNewRoundStarting = (data: { gameId: string }) => {
            if (data.gameId === gameId && socket && state.myPlayerId) {
                console.log('useBiddingSocket: newRoundStarting received, re-emitting clientReadyForBidding');
                socket.emit('clientReadyForBidding', { gameId });
                setState(prev => ({
                    ...prev,
                    biddingStatusMessage: 'New round starting... Waiting for server.',
                    hasBidBeenSubmitted: false,
                    canChooseAction: false,
                    bidOutcome: null
                }));
            }
        };

        // Register all socket listeners
        socket.on('biddingPhaseState', handleBiddingPhaseState);
        socket.on('biddingResolved', handleBiddingResolved);
        socket.on('enableActionChoice', handleEnableActionChoice);
        socket.on('navigateToTruthGuess', handleNavigateToTruthGuess);
        socket.on('opponentIsGuessing', handleOpponentIsGuessing);
        socket.on('navigateToQuestionSelection', handleNavigateToQuestionSelection);
        socket.on('opponentChoosingQuestion', handleOpponentChoosingQuestion);
        socket.on('questionAnswered', handleQuestionAnswered);
        socket.on('truthGuessResult', handleTruthGuessOutcome);
        socket.on('biddingCancelledOpponentLeft', handleBiddingCancelledOpponentLeft);
        socket.on('updatePlayerNames', handleUpdatePlayerNames);
        socket.on('newRoundStarting', handleNewRoundStarting);

        console.log('useBiddingSocket: All listeners attached');

        return () => {
            console.log('useBiddingSocket: Cleaning up listeners');
            socket.off('biddingPhaseState', handleBiddingPhaseState);
            socket.off('biddingResolved', handleBiddingResolved);
            socket.off('enableActionChoice', handleEnableActionChoice);
            socket.off('navigateToTruthGuess', handleNavigateToTruthGuess);
            socket.off('opponentIsGuessing', handleOpponentIsGuessing);
            socket.off('navigateToQuestionSelection', handleNavigateToQuestionSelection);
            socket.off('opponentChoosingQuestion', handleOpponentChoosingQuestion);
            socket.off('questionAnswered', handleQuestionAnswered);
            socket.off('truthGuessResult', handleTruthGuessOutcome);
            socket.off('biddingCancelledOpponentLeft', handleBiddingCancelledOpponentLeft);
            socket.off('updatePlayerNames', handleUpdatePlayerNames);
            socket.off('newRoundStarting', handleNewRoundStarting);
        };
    }, [socket, gameId, state.myPlayerId, navigate, setState]);

    // Emit clientReadyForBidding when ready
    useEffect(() => {
        if (socket && gameId && state.myPlayerId) {
            console.log('useBiddingSocket: Emitting clientReadyForBidding');
            socket.emit('clientReadyForBidding', { gameId });
        }
    }, [socket, gameId, state.myPlayerId]);
}; 