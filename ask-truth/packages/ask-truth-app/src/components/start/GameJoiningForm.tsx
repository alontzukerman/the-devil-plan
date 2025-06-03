import React from 'react';

interface GameJoiningFormProps {
    playerName: string;
    gameIdToJoin: string;
    isConnected: boolean;
    onGameIdChange: (gameId: string) => void;
    onJoinGame: () => void;
}

export const GameJoiningForm: React.FC<GameJoiningFormProps> = ({
    playerName,
    gameIdToJoin,
    isConnected,
    onGameIdChange,
    onJoinGame
}) => {
    return (
        <>
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
                    onChange={(e) => onGameIdChange(e.target.value.toUpperCase())}
                    placeholder="E.g., XXXXXX"
                    className="p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 w-full mb-2"
                />
                <button
                    onClick={onJoinGame}
                    disabled={!playerName.trim() || !gameIdToJoin.trim() || !isConnected}
                    className="btn btn-secondary w-full"
                >
                    Join Game
                </button>
            </div>
        </>
    );
}; 