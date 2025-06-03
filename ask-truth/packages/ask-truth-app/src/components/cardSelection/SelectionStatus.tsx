import React from 'react';

interface SelectionStatusProps {
    hasConfirmedSelection: boolean;
    opponentHasConfirmed: boolean;
    opponentPlayerName: string;
}

export const SelectionStatus: React.FC<SelectionStatusProps> = ({
    hasConfirmedSelection,
    opponentHasConfirmed,
    opponentPlayerName
}) => {
    if (hasConfirmedSelection && !opponentHasConfirmed) {
        return (
            <p className="mt-6 text-xl text-purple-300 italic">
                Waiting for {opponentPlayerName || 'opponent'} to confirm their selection...
            </p>
        );
    }

    if (opponentHasConfirmed && hasConfirmedSelection) {
        return (
            <p className="mt-6 text-xl text-green-300 font-semibold">
                {opponentPlayerName || 'Opponent'} has confirmed! Both players ready!
            </p>
        );
    }

    return null;
}; 