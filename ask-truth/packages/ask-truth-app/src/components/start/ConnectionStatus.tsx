import React from 'react';

interface ConnectionStatusProps {
    isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
    if (isConnected) {
        return null;
    }

    return (
        <div className="mb-4 p-3 bg-warning bg-opacity-50 border-l-4 border-secondary-400 text-secondary-100 rounded-md">
            <p>Connecting to server...</p>
        </div>
    );
}; 