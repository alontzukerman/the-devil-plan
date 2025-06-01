import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext'; // Import useSocket
import { useNavigate } from 'react-router-dom'; // Added import

// Define types for server responses (optional but good practice)
interface Player {
    id: string;
    name: string;
}
interface GameState {
    gameId: string;
    players: Player[];
}

const StartScreen: React.FC = () => {
    const { socket, isConnected } = useSocket(); // Use the socket from context
    const navigate = useNavigate(); // Added hook
    const [playerName, setPlayerName] = useState('');
    const [gameIdToJoin, setGameIdToJoin] = useState('');
    const [createdGameId, setCreatedGameId] = useState<string | null>(null);
    const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [gamePlayers, setGamePlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Listener for when a game is successfully created by this client
        const handleGameCreated = (data: { gameId: string; playerId: string; players: Player[] }) => {
            console.log('Game Created by me:', data);
            setCreatedGameId(data.gameId);
            setGamePlayers(data.players);
            setIsWaitingForOpponent(true);
            setErrorMessage(null);
        };

        // Listener for when any player (including this one) joins a game
        const handlePlayerJoined = (data: { gameId: string; players: Player[] }) => {
            console.log('Player Joined/Game State Update:', data);
            setCreatedGameId(data.gameId); // Useful if joining player sees this screen briefly
            setGamePlayers(data.players);
            setIsWaitingForOpponent(data.players.length < 2);
            setErrorMessage(null);
            // Note: Navigation to game setup is now handled by 'navigateToGameSetup' event
        };

        const handleNavigateToGameSetup = (data: GameState) => {
            console.log('Server says: Navigate to game setup', data);
            setGamePlayers(data.players);
            setIsWaitingForOpponent(false);
            // Navigate to the card selection screen WITH player data and selfId
            navigate(`/game/${data.gameId}/select-cards`, {
                state: {
                    players: data.players,
                    selfId: socket.id // Add the current socket ID here
                }
            });
        };

        const handleGameJoinError = (data: { message: string }) => {
            console.error('Game Join Error:', data.message);
            setErrorMessage(data.message);
        };

        const handlePlayerLeft = (data: { gameId: string; players: Player[]; disconnectedPlayerId: string }) => {
            console.log('Player left:', data);
            setGamePlayers(data.players);
            if (data.players.length < 2) {
                setIsWaitingForOpponent(true); // Go back to waiting if a player leaves
            }
            // If the current user was the one who left, they might be kicked or see a message
            if (socket.id === data.disconnectedPlayerId) {
                setErrorMessage('You have disconnected from the game.');
                setCreatedGameId(null); // Reset UI
                setIsWaitingForOpponent(false);
            }
        };

        socket.on('gameCreated', handleGameCreated);
        socket.on('playerJoined', handlePlayerJoined);
        socket.on('navigateToGameSetup', handleNavigateToGameSetup);
        socket.on('gameJoinError', handleGameJoinError);
        socket.on('playerLeft', handlePlayerLeft);

        // Cleanup listeners when component unmounts or socket changes
        return () => {
            socket.off('gameCreated', handleGameCreated);
            socket.off('playerJoined', handlePlayerJoined);
            socket.off('navigateToGameSetup', handleNavigateToGameSetup);
            socket.off('gameJoinError', handleGameJoinError);
            socket.off('playerLeft', handlePlayerLeft);
        };
    }, [socket, navigate]); // Added navigate to dependency array

    const handleCreateGame = () => {
        if (socket && playerName.trim()) {
            console.log('Attempting to create game with player:', playerName);
            socket.emit('createGame', { playerName: playerName.trim() });
        }
    };

    const handleJoinGame = () => {
        if (socket && playerName.trim() && gameIdToJoin.trim()) {
            console.log('Attempting to join game:', gameIdToJoin, 'as player:', playerName);
            socket.emit('joinGame', { gameId: gameIdToJoin.trim(), playerName: playerName.trim() });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="font-title text-5xl text-yellow-400 mb-12 text-center">
                Ask or Truth
            </h1>

            {!isConnected && (
                <div className="mb-4 p-3 bg-yellow-600 bg-opacity-50 border-l-4 border-yellow-400 text-yellow-100 rounded-md">
                    <p>Connecting to server...</p>
                </div>
            )}

            {isConnected && !createdGameId && !isWaitingForOpponent && gamePlayers.length === 0 && (
                <div className="bg-gray-700 bg-opacity-50 p-8 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm">
                    <div className="mb-6">
                        <label htmlFor="playerName" className="block text-lg font-medium text-gray-200 mb-2">
                            Enter Your Name:
                        </label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="E.g., Player1"
                            className="p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 w-full"
                        />
                    </div>
                    <button
                        onClick={handleCreateGame}
                        disabled={!playerName.trim() || !isConnected}
                        className="btn btn-primary w-full mb-4"
                    >
                        Create New Game
                    </button>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-500"></div>
                        <span className="flex-shrink mx-4 text-gray-400">OR</span>
                        <div className="flex-grow border-t border-gray-500"></div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="gameIdToJoin" className="block text-lg font-medium text-gray-200 mb-2">
                            Enter Game ID to Join:
                        </label>
                        <input
                            type="text"
                            id="gameIdToJoin"
                            value={gameIdToJoin}
                            onChange={(e) => setGameIdToJoin(e.target.value.toUpperCase())}
                            placeholder="E.g., XXXXXX"
                            className="p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 w-full mb-2"
                        />
                        <button
                            onClick={handleJoinGame}
                            disabled={!playerName.trim() || !gameIdToJoin.trim() || !isConnected}
                            className="btn btn-secondary w-full"
                        >
                            Join Game
                        </button>
                    </div>
                </div>
            )}

            {(createdGameId || isWaitingForOpponent || gamePlayers.length > 0) && !errorMessage && (
                <div className="text-center p-6 bg-gray-700 bg-opacity-50 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm">
                    {createdGameId && (
                        <div className="p-4 bg-green-700 bg-opacity-30 border-l-4 border-green-500 mb-4 rounded-md">
                            <p className="text-md text-green-200 mb-2">
                                Game Created! Share this ID with your friend:
                            </p>
                            <p className="font-title text-3xl text-green-300 tracking-wider mb-3 select-all">
                                {createdGameId}
                            </p>
                        </div>
                    )}
                    {isWaitingForOpponent && (
                        <p className="text-lg text-gray-300 italic mb-2">Waiting for opponent to join...</p>
                    )}
                    {gamePlayers.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Players in Game:</h3>
                            <ul className="list-disc list-inside text-gray-300">
                                {gamePlayers.map(p => <li key={p.id}>{p.name} {p.id === socket?.id ? <span className="text-yellow-400 font-semibold">(You)</span> : ""}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {errorMessage && (
                <div className="mt-6 p-4 bg-red-700 bg-opacity-50 border-l-4 border-red-500 text-red-200 rounded-md shadow-md w-full max-w-md">
                    <p className="font-semibold">Error:</p>
                    <p>{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default StartScreen; 