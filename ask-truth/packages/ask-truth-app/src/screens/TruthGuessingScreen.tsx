import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import type { Card as CardType } from '../utils/cardUtils'; // type-only import
import { generateDeck } from '../utils/cardUtils';
import CardComponent from '../components/Card';

interface TruthGuessingLocationState {
    myPlayerId?: string;       // This is the guesserPlayerId
    opponentPlayerName?: string; // This is the targetPlayerName
}

const TruthGuessingScreen: React.FC = () => {
    const { gameId: paramGameId } = useParams<{ gameId: string }>(); // Renamed to avoid conflict if used from state
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket(); // Removed isConnected for now

    const [targetPlayerName, setTargetPlayerName] = useState<string>('');
    const [deck] = useState<CardType[]>(generateDeck());
    const [guessedSeries, setGuessedSeries] = useState<CardType[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>("Attempt to reconstruct your opponent's 8-card series.");
    const [isGuessConfirmed, setIsGuessConfirmed] = useState<boolean>(false);
    const [isMyTurnToGuess, setIsMyTurnToGuess] = useState<boolean>(false);

    useEffect(() => {
        const state = location.state as TruthGuessingLocationState | null;
        console.log('TruthGuessingScreen location.state:', state);

        if (state?.opponentPlayerName && state?.myPlayerId) {
            setTargetPlayerName(state.opponentPlayerName);
            setStatusMessage(`You chose TRUTH. Attempt to reconstruct ${state.opponentPlayerName}'s 8-card secret series.`);
            if (socket && socket.id === state.myPlayerId) { // myPlayerId from state is the guesserId
                setIsMyTurnToGuess(true);
                console.log('TruthGuessingScreen: It IS my turn to guess.');
            } else {
                setIsMyTurnToGuess(false);
                console.log('TruthGuessingScreen: It is NOT my turn to guess. Socket ID:', socket?.id, 'Guesser ID from state:', state?.myPlayerId);
            }
        } else if (!socket) {
            setStatusMessage('Connecting to server...');
        } else {
            setStatusMessage('Waiting for game information from Bidding Screen...');
            console.log('TruthGuessingScreen: Missing opponentPlayerName or myPlayerId in location.state');
        }
    }, [location.state, socket, paramGameId]);

    useEffect(() => {
        if (!socket) return;

        const handleTruthGuessResult = (data: { gameId: string; wasGuessCorrect: boolean; winnerId?: string; winnerName?: string; reason?: string }) => {
            const currentWorkingGameId = paramGameId;
            if (data.gameId === currentWorkingGameId) {
                console.log('Truth Guess Result:', data);
                setIsGuessConfirmed(true);

                if (data.wasGuessCorrect) {
                    setStatusMessage(`Correct! You guessed ${targetPlayerName || 'opponent'}'s series! You win!`);
                    setTimeout(() => {
                        navigate(`/game/${currentWorkingGameId}/game-over`, { state: { winnerName: data.winnerName } });
                    }, 3000);
                } else {
                    setStatusMessage(data.reason || `Incorrect guess. The game continues...`);
                    setTimeout(() => {
                        console.log('Incorrect guess, navigating back to bidding screen.');
                        navigate(`/game/${currentWorkingGameId}/bidding`);
                    }, 3000);
                }
            }
        };

        socket.on('truthGuessResult', handleTruthGuessResult);

        return () => {
            socket.off('truthGuessResult', handleTruthGuessResult);
        };
    }, [socket, paramGameId, navigate, targetPlayerName]);

    const handleSelectFromDeck = (card: CardType) => {
        if (isGuessConfirmed || guessedSeries.length >= 8 || guessedSeries.find(c => c.id === card.id) || !isMyTurnToGuess) return;
        setGuessedSeries(prev => [...prev, card]);
    };

    const handleDeselectFromGuessedSeries = (cardToRemove: CardType) => {
        if (isGuessConfirmed || !isMyTurnToGuess) return;
        setGuessedSeries(prev => prev.filter(card => card.id !== cardToRemove.id));
    };

    const handleConfirmGuess = () => {
        const currentWorkingGameId = paramGameId;
        if (!socket || guessedSeries.length !== 8 || isGuessConfirmed || !isMyTurnToGuess) return;
        console.log('Confirming guess for game:', currentWorkingGameId, 'Guess:', guessedSeries);
        const seriesToSend = guessedSeries.map(({ suit, rank }) => ({ suit: String(suit), rank: Number(rank) })); // Ensure types are string/number
        socket.emit('submitTruthGuess', { gameId: currentWorkingGameId, guess: seriesToSend });
        setIsGuessConfirmed(true);
        setStatusMessage('Your guess has been submitted. Waiting for the result...');
    };

    const handleResetGuess = () => {
        if (isGuessConfirmed || !isMyTurnToGuess) return;
        setGuessedSeries([]);
        setStatusMessage(`Attempt to reconstruct ${targetPlayerName || 'opponent'}'s 8-card secret series.`);
    };

    // Loading States & Edge Case Renders (Themed)
    if (!socket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-400 mb-4">Connecting...</h1>
                <p className="text-gray-300 text-lg">{statusMessage || 'Initializing connection to game server...'}</p>
            </div>
        );
    }
    if (!paramGameId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-red-500 mb-4">Error</h1>
                <p className="text-gray-300 text-lg">Game ID is missing. Cannot load game.</p>
            </div>
        );
    }
    if (isMyTurnToGuess && !targetPlayerName) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-300 mb-4">Loading Truth Phase...</h1>
                <p className="text-gray-300 text-lg">Preparing for your guess... {statusMessage}</p>
            </div>
        );
    }
    if (!isMyTurnToGuess && targetPlayerName) { // Opponent is guessing, current player is the target
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="font-title text-4xl text-yellow-300 mb-6">Truth Phase</h1>
                <p className="text-xl text-gray-200 mb-3">Waiting for <span className="font-semibold text-indigo-300">{targetPlayerName}</span> to make their guess.</p>
                <p className="text-gray-400 mb-4">(You are the target. Your series is being guessed!)</p>
                <p className="italic text-gray-300">{statusMessage}</p>
                {/* Link to navigate back to bidding if stuck, or rely on server push */}
                <button onClick={() => navigate(`/game/${paramGameId}/bidding`)} className="btn btn-secondary mt-8">
                    Return to Game (if stuck)
                </button>
            </div>
        );
    }
    if (!isMyTurnToGuess) { // General fallback if not my turn (e.g. still loading opponent info)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="font-title text-4xl text-yellow-300 mb-4">Loading Truth Phase...</h1>
                <p className="text-gray-300 text-lg">{statusMessage || 'Waiting for opponent and game state...'}</p>
            </div>
        );
    }

    // Main Guessing UI (My Turn)
    return (
        <div className="flex flex-col items-center min-h-screen p-4 pt-6 sm:pt-8">
            <h1 className="font-title text-4xl sm:text-5xl text-yellow-400 mb-3 text-center">
                Truth Phase
            </h1>
            <p className="text-lg mb-5 text-center text-gray-300">
                Guess <span className="font-semibold text-indigo-300">{targetPlayerName || 'Opponent'}</span>'s Secret Series
            </p>
            <p className="text-base mb-6 text-center text-gray-400 italic min-h-[1.5em]">{statusMessage}</p>

            {/* Guessed Series Display Area */}
            <div className="mb-6 w-full max-w-3xl">
                <h2 className="text-xl font-semibold mb-2 text-center text-indigo-300">Your Current Guess ({guessedSeries.length} / 8 cards):</h2>
                <div className="min-h-[8rem] flex items-center justify-center p-2 bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg border-2 border-indigo-500 space-x-1 overflow-x-auto shadow-lg">
                    {guessedSeries.length > 0 ? guessedSeries.map((card) => (
                        <div key={`guessed-${card.id}`} className="transform transition-transform hover:scale-105 flex-shrink-0">
                            <CardComponent
                                card={card}
                                onClick={() => handleDeselectFromGuessedSeries(card)}
                                isSelected={false} // Not using isSelected for visual distinction here, presence is enough
                                isDisabled={isGuessConfirmed}
                                className="w-16 sm:w-20" // Ensure cards are not too large
                            />
                        </div>
                    )) : <p className="text-gray-400 italic">Select 8 cards from the deck below.</p>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="my-4 flex space-x-4">
                <button
                    onClick={handleConfirmGuess}
                    disabled={guessedSeries.length !== 8 || isGuessConfirmed || !isMyTurnToGuess}
                    className="btn btn-primary"
                >
                    Confirm Guess
                </button>
                <button
                    onClick={handleResetGuess}
                    disabled={guessedSeries.length === 0 || isGuessConfirmed || !isMyTurnToGuess}
                    className="btn btn-danger"
                >
                    Reset Guess
                </button>
            </div>

            {/* Available Cards Display (Full Deck) */}
            <div className="w-full max-w-5xl mt-4 p-4 bg-gray-700 bg-opacity-30 backdrop-blur-sm shadow-xl rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-300">Available Cards to Choose From</h2>
                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-13 gap-1 sm:gap-2">
                    {deck.map(card => {
                        const isInGuessedSeries = guessedSeries.find(c => c.id === card.id);
                        return (
                            <div key={card.id} className={`transform transition-transform ${!isInGuessedSeries && !isGuessConfirmed && guessedSeries.length < 8 ? 'hover:scale-110 cursor-pointer' : 'opacity-70'}`}>
                                <CardComponent
                                    card={card}
                                    onClick={() => handleSelectFromDeck(card)}
                                    isSelected={!!isInGuessedSeries}
                                    isDisabled={!!isInGuessedSeries || isGuessConfirmed || guessedSeries.length >= 8}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TruthGuessingScreen; 