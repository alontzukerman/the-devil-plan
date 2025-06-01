import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import type { ClientAskedQuestionInfo } from '../utils/questions'; // QuestionInputParameters is used by ClientAskedQuestionInfo
// import type { AskedQuestionInfo as ClientAskedQuestionInfo } from '../../../ask-truth-server/src/server'; // Path to server type - REMOVED

interface BiddingLocationState {
    players?: { id: string; name: string }[];
    selfId?: string;
    // Add other potential state properties from card selection if needed
}

const BiddingScreen: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const socketContext = useContext(SocketContext);
    const socket = socketContext?.socket;

    const [myPlayerName, setMyPlayerName] = useState<string>('');
    const [opponentPlayerName, setOpponentPlayerName] = useState<string>('');
    const [myPlayerId, setMyPlayerId] = useState<string>('');

    const [myCoins, setMyCoins] = useState<number>(10);
    const [opponentHasFewCoins, setOpponentHasFewCoins] = useState<boolean>(false);
    const [currentBidAmount, setCurrentBidAmount] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(10); // Default, will be set by server
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const [hasBidBeenSubmitted, setHasBidBeenSubmitted] = useState<boolean>(false);
    const [biddingStatusMessage, setBiddingStatusMessage] = useState<string>('Waiting for bidding to start...');
    const [bidOutcome, setBidOutcome] = useState<{ winnerName?: string; bidsTied?: boolean } | null>(null);
    const [canChooseAction, setCanChooseAction] = useState<boolean>(false); // True if this player won the bid
    const [isOpponentChoosingQuestion, setIsOpponentChoosingQuestion] = useState<boolean>(false);
    const [askedQuestions, setAskedQuestions] = useState<ClientAskedQuestionInfo[]>([]); // Use new type

    useEffect(() => {
        if (socket && socket.id && myPlayerId !== socket.id) {
            console.log(`BIDDING_SCREEN_DEBUG (Socket ID Effect): Setting myPlayerId to socket.id "${socket.id}"`);
            setMyPlayerId(socket.id);
        }
    }, [socket, myPlayerId]);

    useEffect(() => {
        const state = location.state as BiddingLocationState | null;
        console.log(`BIDDING_SCREEN_DEBUG (State Effect): location.state changed. Current location.state:`, state);
        if (state?.players && state?.selfId) {
            const self = state.players.find(p => p.id === state.selfId);
            const opponent = state.players.find(p => p.id !== state.selfId);
            if (self && self.name !== myPlayerName) {
                console.log(`BIDDING_SCREEN_DEBUG (State Effect): Setting myPlayerName to "${self.name}" from location.state. Current myPlayerId: "${myPlayerId}" (should match self.id: "${self.id}")`);
                setMyPlayerName(self.name);
            }
            if (opponent) {
                setOpponentPlayerName(opponent.name);
            } else {
                setOpponentPlayerName('Waiting for opponent...');
            }
        } else {
            console.log(`BIDDING_SCREEN_DEBUG (State Effect): location.state is null or incomplete. myPlayerId: "${myPlayerId}", myPlayerName: "${myPlayerName}"`);
        }
    }, [location.state, myPlayerId, myPlayerName]);

    useEffect(() => {
        if (socket && gameId && myPlayerId) {
            console.log(`BIDDING_SCREEN_DEBUG (Mount/Ready Effect): Emitting clientReadyForBidding for game ${gameId}. MyPlayerId (Socket ID): ${myPlayerId}`);
            socket.emit('clientReadyForBidding', { gameId /*, playerId: myPlayerId */ });
        }
    }, [socket, gameId, myPlayerId]);

    // Refs for values needed in handlers to avoid stale closures
    const myPlayerNameRef = React.useRef(myPlayerName);
    useEffect(() => {
        myPlayerNameRef.current = myPlayerName;
        console.log(`BIDDING_SCREEN_DEBUG (Ref Update): myPlayerNameRef updated to "${myPlayerName}"`);
    }, [myPlayerName]);

    const opponentPlayerNameRef = React.useRef(opponentPlayerName);
    useEffect(() => {
        opponentPlayerNameRef.current = opponentPlayerName;
        console.log(`BIDDING_SCREEN_DEBUG (Ref Update): opponentPlayerNameRef updated to "${opponentPlayerName}"`);
    }, [opponentPlayerName]);

    const bidOutcomeRef = React.useRef(bidOutcome);
    useEffect(() => {
        bidOutcomeRef.current = bidOutcome;
        console.log(`BIDDING_SCREEN_DEBUG (Ref Update): bidOutcomeRef updated.`, bidOutcome);
    }, [bidOutcome]);

    useEffect(() => {
        console.log(`BIDDING_SCREEN_DEBUG (Main Listener Effect): Running. Socket Connected: ${!!socket}, Socket ID: ${socket?.id}, Game ID: ${gameId}, MyPlayerId: "${myPlayerId}", MyPlayerName (ref): "${myPlayerNameRef.current}"`);

        if (!socket || !gameId || !myPlayerId) {
            console.log('BIDDING_SCREEN_DEBUG (Main Listener Effect): Aborting listener setup (no socket, gameId, or myPlayerId).');
            return;
        }
        console.log('BIDDING_SCREEN_DEBUG (Main Listener Effect): Proceeding to attach listeners WITH myPlayerId available.');

        // ---- ALL HANDLER DEFINITIONS ----
        const handleBiddingPhaseState = (data: {
            gameId: string; myPlayerId: string; myPlayerName: string; myInitialCoins: number;
            opponentName: string; opponentLowCoins: boolean; timerDuration: number;
            askedQuestionsHistory?: ClientAskedQuestionInfo[];
        }) => {
            console.log(`BIDDING_SCREEN_DEBUG (handleBiddingPhaseState): Event received. Component gameId: "${gameId}", Event data.gameId: "${data.gameId}", Event myPlayerId: "${data.myPlayerId}"`);
            if (data.gameId === gameId) {
                console.log('BIDDING_SCREEN_DEBUG (handleBiddingPhaseState): Game ID matches. Processing event data:', data);
                if (data.myPlayerName !== myPlayerNameRef.current) setMyPlayerName(data.myPlayerName);
                if (data.myPlayerId !== myPlayerId) {
                    console.warn(`BIDDING_SCREEN_DEBUG (handleBiddingPhaseState): Event myPlayerId "${data.myPlayerId}" (from server) differs from component's current myPlayerId "${myPlayerId}" (socket.id). Trusting server for this event's context.`);
                    setMyPlayerId(data.myPlayerId);
                }
                setMyCoins(data.myInitialCoins);
                setOpponentPlayerName(data.opponentName);
                setOpponentHasFewCoins(data.opponentLowCoins);
                setTimeLeft(data.timerDuration);
                setIsTimerActive(true);
                setHasBidBeenSubmitted(false);
                setCurrentBidAmount(0);
                setBidOutcome(null);
                setCanChooseAction(false);
                setIsOpponentChoosingQuestion(false);
                if (data.askedQuestionsHistory) {
                    setAskedQuestions(data.askedQuestionsHistory);
                } else {
                    console.log('No askedQuestionsHistory in biddingPhaseState, client history maintained for now.');
                }
                setBiddingStatusMessage(`Bidding started! You have ${data.myInitialCoins} coins. Time left: ${data.timerDuration}s`);
            } else {
                console.warn('BIDDING_SCREEN_DEBUG (handleBiddingPhaseState): Game ID mismatch. Ignoring event.');
            }
        };

        const handleBiddingResolved = (data: {
            winnerId?: string; winnerName?: string; bidsTied: boolean;
            yourNewCoinTotal: number; opponentNewLowCoinsStatus: boolean;
        }) => {
            const currentMyPlayerId = myPlayerId;
            console.log('BIDDING_SCREEN_DEBUG (handleBiddingResolved): Event received:', data);
            setIsTimerActive(false);
            setMyCoins(data.yourNewCoinTotal);
            setOpponentHasFewCoins(data.opponentNewLowCoinsStatus);
            setHasBidBeenSubmitted(true);
            setIsOpponentChoosingQuestion(false);

            if (data.bidsTied) {
                setBidOutcome({ bidsTied: true });
                setBiddingStatusMessage('Bids were tied! Starting a new bidding round shortly...');
            } else if (data.winnerId) {
                setBidOutcome({ winnerName: data.winnerName });
                if (data.winnerId === currentMyPlayerId) {
                    setBiddingStatusMessage(`You won the bid with ${data.winnerName}! Choose an action.`);
                    setCanChooseAction(true);
                } else {
                    setBiddingStatusMessage(`${data.winnerName} won the bid. Waiting for them to choose an action...`);
                    setCanChooseAction(false);
                }
            } else {
                setBiddingStatusMessage('Bidding ended. No winner determined. A new round will start.');
            }
        };

        const handleEnableActionChoice = (data: { gameId: string }) => {
            const currentBidOutcome = bidOutcomeRef.current;
            const currentMyPlayerName = myPlayerNameRef.current;
            console.log('BIDDING_SCREEN_DEBUG (handleEnableActionChoice): Event received:', data, 'Current bidOutcome (ref):', currentBidOutcome, 'My Name (ref):', currentMyPlayerName);

            if (data.gameId === gameId && currentBidOutcome?.winnerName === currentMyPlayerName && !currentBidOutcome?.bidsTied) {
                setCanChooseAction(true);
                setIsOpponentChoosingQuestion(false);
                setBiddingStatusMessage('You won the bid! Please choose Ask or Truth.');
            }
        };

        const handleOpponentSelectedAction = (data: { gameId: string, playerName: string, action: string, message?: string }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleOpponentSelectedAction): Event received:', data);
            if (data.gameId === gameId && data.playerName !== myPlayerNameRef.current) {
                setBiddingStatusMessage(data.message || `${data.playerName} chose ${data.action}.`);
                setCanChooseAction(false);
                setIsOpponentChoosingQuestion(false);
            }
        };

        interface ForceNavigateState { [key: string]: unknown; }
        const handleForceNavigate = (data: { gameId: string, path: string, state?: ForceNavigateState }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleForceNavigate): Event received:', data);
            if (data.gameId === gameId) {
                setIsTimerActive(false);
                navigate(data.path, { state: data.state });
            }
        };

        interface NavigateToTruthGuessPayload {
            gameId: string; guesserId: string; guesserName: string;
            targetId: string; targetName: string;
        }
        const handleNavigateToTruthGuess = (data: NavigateToTruthGuessPayload) => {
            console.log('BIDDING_SCREEN_DEBUG (handleNavigateToTruthGuess): Event received:', data);
            if (data.gameId === gameId && data.guesserId === myPlayerId) {
                setIsTimerActive(false);
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

        interface OpponentIsGuessingPayload {
            gameId: string; guesserId: string; guesserName: string;
        }
        const handleOpponentIsGuessing = (data: OpponentIsGuessingPayload) => {
            console.log('BIDDING_SCREEN_DEBUG (handleOpponentIsGuessing): Event received:', data);
            if (data.gameId === gameId && data.guesserId !== myPlayerId) {
                setBiddingStatusMessage(`${data.guesserName} chose TRUTH and is now attempting to guess your secret series... Please wait.`);
                setCanChooseAction(false);
                setBidOutcome(null);
            }
        };

        const handleBiddingCancelledOpponentLeft = (data: { message: string }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleBiddingCancelledOpponentLeft): Event received:', data);
            setBiddingStatusMessage(data.message || 'Opponent left during bidding. Round cancelled.');
            setIsTimerActive(false);
            setCanChooseAction(false);
            setBidOutcome(null);
        };

        const handleUpdatePlayerNames = (data: { currentPlayerName: string, opponentPlayerName: string }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleUpdatePlayerNames): Event received:', data);
            setMyPlayerName(data.currentPlayerName);
            setOpponentPlayerName(data.opponentPlayerName);
        };

        const handleTruthGuessOutcome = (data: { gameId: string; wasGuessCorrect: boolean; winnerId?: string; winnerName?: string }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleTruthGuessOutcome): Event received:', data);
            if (data.gameId === gameId && data.wasGuessCorrect) {
                setIsTimerActive(false);
                setBiddingStatusMessage(`${data.winnerName} correctly guessed the series! Game Over.`);
                setTimeout(() => { navigate(`/game/${gameId}/game-over`, { state: { winnerName: data.winnerName } }); }, 3000);
            } else if (data.gameId === gameId && !data.wasGuessCorrect) {
                setBiddingStatusMessage('Opponent made an incorrect guess. A new bidding round will start.');
            }
        };

        const handleNavigateToQuestionSelection = (data: { gameId: string; chooserName?: string }) => {
            const currentMyPlayerName = myPlayerNameRef.current;
            const currentMyPlayerId = myPlayerId;
            console.log(
                `BIDDING_SCREEN_DEBUG (handleNavigateToQuestionSelection): Event received. ` +
                `Event gameId: "${data.gameId}", Component gameId: "${gameId}". ` +
                `Event chooserName: "${data.chooserName}", My Name (ref): "${currentMyPlayerName}". ` +
                `MyPlayerId (state): "${currentMyPlayerId}"`,
                data
            );
            if (data.gameId === gameId && data.chooserName === currentMyPlayerName) {
                console.log('BIDDING_SCREEN_DEBUG (handleNavigateToQuestionSelection): Conditions met. Navigating...');
                setIsTimerActive(false);
                navigate(`/game/${gameId}/select-question`);
            } else {
                console.warn(
                    `BIDDING_SCREEN_DEBUG (handleNavigateToQuestionSelection): NOT navigating. ` +
                    `Game ID match: ${data.gameId === gameId}. ` +
                    `Chooser name match: ${data.chooserName === currentMyPlayerName}.`
                );
            }
        };

        const handleOpponentChoosingQuestion = (data: { gameId: string; chooserName?: string }) => {
            const currentMyPlayerName = myPlayerNameRef.current;
            console.log(
                `BIDDING_SCREEN_DEBUG (handleOpponentChoosingQuestion): Received. ` +
                `My component's gameId: "${gameId}", Event data.gameId: "${data.gameId}". ` +
                `CurrentMyPlayerName (ref): "${currentMyPlayerName}", Event chooserName: "${data.chooserName}".`,
                'Full event data:', data
            );
            if (data.gameId === gameId) {
                if (data.chooserName !== currentMyPlayerName) {
                    const chooserDisplayName = data.chooserName || 'Opponent';
                    setBiddingStatusMessage(`${chooserDisplayName} chose to ASK and is now selecting a question... Please wait.`);
                    setCanChooseAction(false);
                    setIsOpponentChoosingQuestion(true);
                    setBidOutcome(null);
                } else {
                    console.log('BIDDING_SCREEN_DEBUG (handleOpponentChoosingQuestion): I am the chooser, navigation should be handled by navigateToQuestionSelection.');
                    setIsOpponentChoosingQuestion(false);
                }
            }
        };

        const handleQuestionAnswered = (data: ClientAskedQuestionInfo & { gameId: string }) => {
            const currentMyPlayerId = myPlayerId;
            const currentOpponentPlayerName = opponentPlayerNameRef.current;
            console.log('BIDDING_SCREEN_DEBUG (handleQuestionAnswered): Event received:', data, `MyId: ${currentMyPlayerId}`);
            if (data.gameId !== gameId && gameId) return;
            setAskedQuestions(prev => {
                if (prev.find(q => q.questionId === data.questionId && q.askedByPlayerId === data.askedByPlayerId && JSON.stringify(q.params) === JSON.stringify(data.params))) return prev;
                return [...prev, data];
            });
            setIsOpponentChoosingQuestion(false);
            setCanChooseAction(false);
            const displayAskerName = data.askedByPlayerId === currentMyPlayerId ? "You" : currentOpponentPlayerName || "Opponent";
            const displayTargetName = data.answeredByPlayerId === currentMyPlayerId ? "you" : currentOpponentPlayerName || "Opponent";
            let answerText = String(data.answer);
            if (typeof data.answer === 'boolean') answerText = data.answer ? 'TRUE' : 'FALSE';
            let paramsString = "";
            if (data.params?.positions) paramsString = ` (Selected positions: ${data.params.positions.map(p => p + 1).join(', ')})`;
            setBiddingStatusMessage(`Q from ${displayAskerName} to ${displayTargetName}: "${data.questionText}"${paramsString} | Answer: ${answerText}. Next round starting...`);
        };

        const handleNavigateToBiddingScreenAfterQuestion = (data: { gameId: string; nextScreenPath: string }) => {
            console.log('BIDDING_SCREEN_DEBUG (handleNavigateToBiddingScreenAfterQuestion): Event received:', data);
            if (data.gameId === gameId) {
                setIsOpponentChoosingQuestion(false);
            }
        };

        const handleNewRoundStarting = (data: { gameId: string }) => {
            if (data.gameId === gameId && socket && myPlayerId) {
                console.log(`BIDDING_SCREEN_DEBUG (handleNewRoundStarting): Received for game ${data.gameId}. MyPlayerId: ${myPlayerId}. Re-emitting clientReadyForBidding.`);
                socket.emit('clientReadyForBidding', { gameId });
                setBiddingStatusMessage('New round starting... Waiting for server.');
                setHasBidBeenSubmitted(false);
                setCanChooseAction(false);
                setBidOutcome(null); // Reset bid outcome
                // Other UI resets for a new round can be done here or rely on biddingPhaseState
            } else {
                console.log(`BIDDING_SCREEN_DEBUG (handleNewRoundStarting): Received for game ${data.gameId}, but conditions not met (socket: ${!!socket}, myPlayerId: ${myPlayerId}) or gameId mismatch (component gameId: ${gameId}).`);
            }
        };
        // ---- END HANDLER DEFINITIONS ----

        socket.on('biddingPhaseState', handleBiddingPhaseState);
        socket.on('biddingResolved', handleBiddingResolved);
        socket.on('enableActionChoice', handleEnableActionChoice);
        socket.on('opponentSelectedAction', handleOpponentSelectedAction);
        socket.on('forceNavigate', handleForceNavigate);
        socket.on('navigateToTruthGuess', handleNavigateToTruthGuess);
        socket.on('opponentIsGuessing', handleOpponentIsGuessing);
        socket.on('biddingCancelledOpponentLeft', handleBiddingCancelledOpponentLeft);
        socket.on('updatePlayerNames', handleUpdatePlayerNames);
        socket.on('truthGuessResult', handleTruthGuessOutcome);
        socket.on('navigateToQuestionSelection', handleNavigateToQuestionSelection);
        socket.on('opponentChoosingQuestion', handleOpponentChoosingQuestion);
        socket.on('questionAnswered', handleQuestionAnswered);
        socket.on('navigateToBiddingScreenAfterQuestion', handleNavigateToBiddingScreenAfterQuestion);
        socket.on('newRoundStarting', handleNewRoundStarting); // Add new listener

        console.log('BIDDING_SCREEN_DEBUG (Main Listener Effect): Listeners attached.');

        return () => {
            console.log('BIDDING_SCREEN_DEBUG (Main Listener Effect): Cleaning up listeners.');
            socket.off('biddingPhaseState', handleBiddingPhaseState);
            socket.off('biddingResolved', handleBiddingResolved);
            socket.off('enableActionChoice', handleEnableActionChoice);
            socket.off('opponentSelectedAction', handleOpponentSelectedAction);
            socket.off('forceNavigate', handleForceNavigate);
            socket.off('navigateToTruthGuess', handleNavigateToTruthGuess);
            socket.off('opponentIsGuessing', handleOpponentIsGuessing);
            socket.off('biddingCancelledOpponentLeft', handleBiddingCancelledOpponentLeft);
            socket.off('updatePlayerNames', handleUpdatePlayerNames);
            socket.off('truthGuessResult', handleTruthGuessOutcome);
            socket.off('navigateToQuestionSelection', handleNavigateToQuestionSelection);
            socket.off('opponentChoosingQuestion', handleOpponentChoosingQuestion);
            socket.off('questionAnswered', handleQuestionAnswered);
            socket.off('navigateToBiddingScreenAfterQuestion', handleNavigateToBiddingScreenAfterQuestion);
            socket.off('newRoundStarting', handleNewRoundStarting); // Clean up new listener
        };
    }, [socket, gameId, myPlayerId, navigate]);

    // Timer countdown effect
    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            const timerId = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timerId);
        } else if (isTimerActive && timeLeft === 0) {
            setIsTimerActive(false);
            if (!hasBidBeenSubmitted) {
                setBiddingStatusMessage('Time up! Submitting your bid of ' + currentBidAmount + ' coins.');
                console.log('Timer ended, submitting bid:', currentBidAmount);
                socket?.emit('submitFinalBid', { gameId, bidAmount: currentBidAmount });
                setHasBidBeenSubmitted(true);
            }
        }
    }, [isTimerActive, timeLeft, socket, gameId, currentBidAmount, hasBidBeenSubmitted]);

    const handleIncreaseBid = () => {
        if (!isTimerActive || hasBidBeenSubmitted) return;
        if (myCoins > currentBidAmount) {
            setCurrentBidAmount(prev => prev + 1);
        }
    };

    const handleDecreaseBid = () => {
        if (!isTimerActive || hasBidBeenSubmitted) return;
        if (currentBidAmount > 0) {
            setCurrentBidAmount(prev => prev - 1);
        }
    };

    const handleChooseAction = (action: 'Ask' | 'Truth') => {
        if (!canChooseAction || !socket || !gameId) return;
        console.log(`Player chose action: ${action}`);
        socket.emit('playerMadeChoice', { gameId, choice: action });
        setCanChooseAction(false);
        if (action === 'Ask') {
            setBiddingStatusMessage('You chose to Ask. Selecting a question...');
        } else {
            setBiddingStatusMessage('You chose Truth. Preparing to guess...');
        }
    };

    if (!socketContext || !socket) {
        return (
            <div className="p-4 bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center tritium-font">
                <h1 className="text-3xl font-bold mb-4 text-yellow-400">Connecting to Bidding...</h1>
                <p>{biddingStatusMessage}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-slate-700 p-6 md:p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-cinzel-decorative text-center text-amber-400 mb-6">
                    Bidding Phase
                </h1>

                {/* Player Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-lg">
                    <div className="bg-slate-600 p-4 rounded-md">
                        <p><strong>{myPlayerName || 'You'}</strong></p>
                        <p>Coins: <span className="font-bold text-yellow-400">{myCoins}</span></p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded-md">
                        <p><strong>{opponentPlayerName || 'Opponent'}</strong></p>
                        <p>Coins: {opponentHasFewCoins ?
                            <span className="font-bold text-red-500">5 or Less</span> :
                            <span className="text-gray-400">(Normal)</span>}
                        </p>
                    </div>
                </div>

                {/* Bidding Controls / Status */}
                <div className="bg-slate-600 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold text-center text-sky-300 mb-4">
                        {isTimerActive ? `Time Left: ${timeLeft}s` :
                            isOpponentChoosingQuestion ? `${opponentPlayerName || 'Opponent'} is Choosing a Question` : // More specific title when opponent is choosing
                                (bidOutcome && !canChooseAction) ? 'Bid Resolved' :
                                    canChooseAction ? 'Your Action' : 'Place Your Bid'}
                    </h2>

                    {!hasBidBeenSubmitted && isTimerActive && (
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            <button
                                onClick={handleDecreaseBid}
                                disabled={currentBidAmount === 0 || !isTimerActive || hasBidBeenSubmitted}
                                className="btn bg-red-600 hover:bg-red-700 px-6 py-3 text-xl disabled:opacity-50"
                            >
                                -
                            </button>
                            <span className="text-3xl font-bold text-amber-400 w-16 text-center">{currentBidAmount}</span>
                            <button
                                onClick={handleIncreaseBid}
                                disabled={currentBidAmount >= myCoins || !isTimerActive || hasBidBeenSubmitted}
                                className="btn bg-green-600 hover:bg-green-700 px-6 py-3 text-xl disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                    )}
                    <p className="text-center text-sky-200 min-h-[2em]">{biddingStatusMessage}</p>
                </div>

                {/* Action Choice Buttons (only if canChooseAction is true) */}
                {canChooseAction && (
                    <div className="mt-6 p-6 bg-slate-600 rounded-lg">
                        <h3 className="text-2xl font-semibold text-center text-amber-300 mb-4">Choose Your Action</h3>
                        <div className="flex flex-col sm:flex-row justify-around items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => handleChooseAction('Ask')}
                                className="btn btn-primary py-3 px-8 text-xl w-full sm:w-auto"
                            >
                                Ask a Question
                            </button>
                            <button
                                onClick={() => handleChooseAction('Truth')}
                                className="btn btn-secondary py-3 px-8 text-xl w-full sm:w-auto"
                            >
                                Guess Their Truth
                            </button>
                        </div>
                    </div>
                )}

                {/* Display Asked Questions */}
                {askedQuestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-500">
                        <h3 className="text-2xl font-cinzel-decorative text-center text-amber-300 mb-4">
                            Question History
                        </h3>
                        <ul className="space-y-3 max-h-60 overflow-y-auto bg-slate-600 p-4 rounded-md scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-700">
                            {askedQuestions.map((q, index) => {
                                const askerName = q.askedByPlayerId === myPlayerId ? myPlayerName : opponentPlayerName;
                                const targetName = q.answeredByPlayerId === myPlayerId ? myPlayerName : opponentPlayerName;
                                let displayAnswer = String(q.answer);
                                if (typeof q.answer === 'boolean') {
                                    displayAnswer = q.answer ? 'TRUE' : 'FALSE';
                                }
                                // Add more specific formatting for array answers if needed

                                let displayParams = "";
                                if (q.params && q.params.positions) {
                                    displayParams = ` (Pos: ${q.params.positions.map(p => p + 1).join(', ')})`;
                                }
                                // Add more param formatting here

                                return (
                                    <li key={`${q.questionId}-${q.askedByPlayerId}-${index}`} className="p-3 bg-slate-500/70 rounded shadow">
                                        <p className="text-xs text-sky-300 mb-1">
                                            <span className="font-semibold">{askerName || 'Player'}</span> asked <span className="font-semibold">{targetName || 'Player'}</span>:
                                        </p>
                                        <p className="font-normal text-md text-white">"{q.questionText}"<span className="text-xs text-gray-300 italic">{displayParams}</span></p>
                                        <p className="text-md mt-1">
                                            Answer: <span className={`font-bold ${typeof q.answer === 'boolean' ? (q.answer ? 'text-green-400' : 'text-red-400') : 'text-yellow-300'}`}>
                                                {displayAnswer}
                                            </span>
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiddingScreen; 