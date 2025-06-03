import React from 'react';

interface GameCreationFormProps {
    playerName: string;
    isConnected: boolean;
    onPlayerNameChange: (name: string) => void;
    onCreateGame: () => void;
}

export const GameCreationForm: React.FC<GameCreationFormProps> = ({
    playerName,
    isConnected,
    onPlayerNameChange,
    onCreateGame
}) => {
    return (
        <>
            <div className="mb-6">
                <label htmlFor="playerName" className="block text-lg font-medium text-gray-200 mb-2">
                    Enter Your Name:
                </label>
                <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => onPlayerNameChange(e.target.value)}
                    placeholder="E.g., Player1"
                    className="p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 w-full"
                />
            </div>
            <button
                onClick={onCreateGame}
                disabled={!playerName.trim() || !isConnected}
                className="btn btn-primary w-full mb-4"
            >
                Create New Game
            </button>
        </>
    );
}; 