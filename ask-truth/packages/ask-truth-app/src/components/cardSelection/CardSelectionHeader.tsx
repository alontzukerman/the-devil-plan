import React from 'react';

interface CardSelectionHeaderProps {
    gameId: string | undefined;
    currentPlayerName: string;
    statusMessage: string;
}

export const CardSelectionHeader: React.FC<CardSelectionHeaderProps> = ({
    gameId,
    currentPlayerName,
    statusMessage
}) => {
    return (
        <header className="w-full max-w-5xl mx-auto mb-6 p-4 bg-gray-800 bg-opacity-70 backdrop-blur-md shadow-xl rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h1 className="font-title text-4xl text-yellow-400">Card Selection</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-400">
                        Game ID: <span className="font-semibold text-gray-200">{gameId}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                        You: <span className="font-semibold text-gray-200">{currentPlayerName}</span>
                    </p>
                </div>
            </div>
            <p className="text-center text-gray-200 text-lg">{statusMessage}</p>
        </header>
    );
}; 