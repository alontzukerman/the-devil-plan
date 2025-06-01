import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import type { Card as CardType } from '../utils/cardUtils'; // Suit type import removed
import { generateDeck, SUITS, isSeriesValid } from '../utils/cardUtils'; // Added isSeriesValid
import CardComponent from '../components/Card';

// Define Player type to match what StartScreen sends via route state
interface Player {
    id: string;
    name: string;
}

// PlayerInfo might be used later with socket events
// interface PlayerInfo {
//     id: string;
//     name: string;
//     // Add other relevant player details if needed by this screen
// }

// GameSetupState might be used later with socket events
// interface GameSetupState {
//     gameId: string;
//     players: PlayerInfo[];
//     // other initial game state for card selection if any
// }

const CardSelectionScreen: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const location = useLocation(); // Get location object
    const { socket, isConnected } = useSocket(); // socket will be used for listeners soon

    const [deck, setDeck] = useState<CardType[]>(generateDeck());
    const [selectedSeries, setSelectedSeries] = useState<CardType[]>([]);
    const [hasConfirmedSelection, setHasConfirmedSelection] = useState(false);
    const [opponentHasConfirmed, setOpponentHasConfirmed] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Select your 8-card secret series.');
    const [currentPlayerName, setCurrentPlayerName] = useState('Player 1'); // Initial placeholder
    const [opponentPlayerName, setOpponentPlayerName] = useState('Player 2'); // Initial placeholder

    // Placeholder for game state if needed (e.g. player info)
    // const [gameInfo, setGameInfo] = useState<GameSetupState | null>(null);

    useEffect(() => {
        const routeState = location.state as { players?: Player[]; selfId?: string };
        if (routeState?.players && routeState?.selfId) {
            const self = routeState.players.find(p => p.id === routeState.selfId);
            const opponent = routeState.players.find(p => p.id !== routeState.selfId);

            if (self) {
                setCurrentPlayerName(self.name);
            }
            if (opponent) {
                setOpponentPlayerName(opponent.name);
            } else if (routeState.players.length === 1 && self) {
                // Only self in the game (creator waiting for opponent)
                setOpponentPlayerName('Waiting for opponent...');
            }
        } else {
            // Fallback or if no state is passed (e.g. direct navigation / refresh without state persistence)
            // In this case, rely on `updatePlayerNames` socket event or set generic names
            // For now, initial useState placeholders will be used until socket updates them.
            console.log('CardSelectionScreen: No route state found for player names, relying on socket or placeholders.');
        }
    }, [location.state]); // Effect runs when location state is available/changes

    useEffect(() => {
        if (!gameId) {
            console.error('No game ID found, redirecting to start.');
            navigate('/');
            return;
        }
        console.log(`Card Selection for Game ID: ${gameId}, Socket Connected: ${isConnected}, Socket ID: ${socket?.id}`);

        if (socket) {
            // Listener for when the opponent confirms their series
            const handleOpponentConfirmed = (data: { opponentName?: string }) => {
                setOpponentHasConfirmed(true);
                const name = data.opponentName || 'Opponent'; // Use provided name or default
                setOpponentPlayerName(name); // Update opponent's name if provided
                if (hasConfirmedSelection) {
                    setStatusMessage(`${name} has also confirmed. Both ready!`);
                } else {
                    setStatusMessage(`${name} has confirmed their series. Please confirm yours.`);
                }
            };

            // Listener for when both players are ready and it's time to navigate
            const handleNavigateToBidding = (data: { nextScreen: string }) => {
                setStatusMessage('Both players confirmed! Navigating to bidding...');
                // Small delay to allow user to read message before navigating
                setTimeout(() => {
                    navigate(data.nextScreen); // e.g., /game/:gameId/bidding
                }, 2000);
            };

            // Listener for player details (optional, if not handled by initial join)
            const handlePlayerDetails = (data: { currentPlayerName: string, opponentPlayerName: string }) => {
                setCurrentPlayerName(data.currentPlayerName);
                setOpponentPlayerName(data.opponentPlayerName);
            };

            socket.on('opponentSeriesConfirmed', handleOpponentConfirmed);
            socket.on('allReadyNavigateToBidding', handleNavigateToBidding);
            socket.on('updatePlayerNames', handlePlayerDetails); // Example event for names

            // Request player names if not already set or to ensure they are fresh
            // This is an example, actual implementation might vary based on server logic
            // socket.emit('requestPlayerNames', { gameId });

            return () => {
                socket.off('opponentSeriesConfirmed', handleOpponentConfirmed);
                socket.off('allReadyNavigateToBidding', handleNavigateToBidding);
                socket.off('updatePlayerNames', handlePlayerDetails);
            };
        }
    }, [gameId, navigate, isConnected, socket, hasConfirmedSelection]); // Added hasConfirmedSelection to dependency array

    const handleSelectFromDeck = useCallback((cardToSelect: CardType) => {
        if (hasConfirmedSelection) return; // Don't allow changes after confirmation
        if (selectedSeries.length < 8 && !selectedSeries.find(card => card.id === cardToSelect.id)) {
            setSelectedSeries(prevSeries => [...prevSeries, cardToSelect]);
        }
    }, [selectedSeries, hasConfirmedSelection]);

    const handleDeselectFromSeries = useCallback((cardToDeselect: CardType) => {
        if (hasConfirmedSelection) return; // Don't allow changes after confirmation
        setSelectedSeries(prevSeries => prevSeries.filter(card => card.id !== cardToDeselect.id));
    }, [hasConfirmedSelection]);

    const handleResetSelection = useCallback(() => {
        if (hasConfirmedSelection) return; // Cannot reset after confirmation
        setSelectedSeries([]);
        setStatusMessage('Selection reset. Select your 8-card secret series again.');
    }, [hasConfirmedSelection]);

    const handleConfirmSelection = useCallback(() => {
        if (selectedSeries.length !== 8) {
            setStatusMessage('Please select exactly 8 cards for your series.');
            return;
        }
        if (!isSeriesValid(selectedSeries)) {
            setStatusMessage('Invalid series: Cards of the same suit must be in ascending order (Aces low). Please correct your series.');
            return;
        }

        // If valid and all checks pass:
        setHasConfirmedSelection(true);
        setStatusMessage('Your series is confirmed! Waiting for opponent...');

        if (socket) {
            console.log('Emitting playerSelectedSeries with:', { gameId, series: selectedSeries });
            socket.emit('playerSelectedSeries', { gameId, series: selectedSeries });
            // Note: The actual series data sent to the server might need to be just ranks and suits,
            // depending on what the backend expects, not the full CardType objects with client-side IDs.
            // For now, sending the full objects as the CardType is shared.
        }
    }, [selectedSeries, gameId, socket, navigate]); // navigate might be used later if both confirm

    // More useEffects for socket listeners will be added in subsequent steps

    // TODO: Implement card selection logic (Step 4)
    // TODO: Implement confirm selection logic (Step 5)
    // TODO: Implement socket event listeners (Step 5)

    return (
        <div className="flex flex-col items-center p-4 pb-8 min-h-screen">
            <header className="w-full max-w-5xl mx-auto mb-6 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-md shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h1 className="font-title text-4xl text-yellow-400">Card Selection</h1>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Game ID: <span className="font-semibold text-gray-200">{gameId}</span></p>
                        <p className="text-sm text-gray-400">You: <span className="font-semibold text-gray-200">{currentPlayerName}</span></p>
                        {/* <p className="text-sm text-gray-400">Opponent: <span className="font-semibold text-gray-200">{opponentPlayerName}</span></p> */}
                    </div>
                </div>
                <p className="text-center text-gray-200 text-lg">{statusMessage}</p>
            </header>

            {/* Player's Selected Series Display */}
            <div className="my-4 p-3 bg-gray-700 bg-opacity-50 shadow-lg rounded-lg w-full max-w-3xl min-h-[8rem] flex items-center justify-center border-2 border-indigo-500">
                {selectedSeries.length === 0 ? (
                    <p className="text-gray-400 italic">Your 8-card series will appear here in selection order.</p>
                ) : (
                    <div className="flex space-x-1 overflow-x-auto p-2">
                        {selectedSeries.map(card => (
                            <CardComponent
                                key={`selected-${card.id}`}
                                card={card}
                                onClick={handleDeselectFromSeries}
                                isSelected
                                className="flex-shrink-0 w-16 sm:w-20"
                            />
                        ))}
                    </div>
                )}
            </div>
            <p className="my-2 text-lg font-medium text-gray-200">
                Selected: {selectedSeries.length} / 8 cards
            </p>

            {/* Available Cards Display (The Deck) */}
            <div className="p-4 bg-gray-700 bg-opacity-30 shadow-xl rounded-lg w-full max-w-5xl mt-4">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-200">Available Cards</h2>
                {SUITS.map(suit => (
                    <div key={suit} className="mb-3">
                        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-13 gap-1 sm:gap-2">
                            {deck.filter(card => card.suit === suit).map(card => (
                                <CardComponent
                                    key={card.id}
                                    card={card}
                                    onClick={handleSelectFromDeck}
                                    isDisabled={selectedSeries.some(sc => sc.id === card.id) || hasConfirmedSelection}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-6">
                <button
                    className="btn btn-primary"
                    disabled={selectedSeries.length !== 8 || hasConfirmedSelection}
                    onClick={handleConfirmSelection}
                >
                    Confirm Selection
                </button>
                <button
                    className="btn btn-danger"
                    onClick={handleResetSelection}
                    disabled={hasConfirmedSelection || selectedSeries.length === 0}
                >
                    Reset
                </button>
            </div>

            {/* Status Messages */}
            {hasConfirmedSelection && !opponentHasConfirmed && (
                <p className="mt-6 text-xl text-purple-300 italic">
                    Waiting for {opponentPlayerName || 'opponent'} to confirm their selection...
                </p>
            )}
            {opponentHasConfirmed && hasConfirmedSelection && (
                <p className="mt-6 text-xl text-green-300 font-semibold">
                    {opponentPlayerName || 'Opponent'} has confirmed! Both players ready!
                </p>
            )}
        </div>
    );
};

export default CardSelectionScreen; 