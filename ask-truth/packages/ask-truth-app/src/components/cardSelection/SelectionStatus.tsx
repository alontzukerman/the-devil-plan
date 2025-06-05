import React from 'react';
import { GameStatus } from '@ask-truth/ui';

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
            <div className="mt-6">
                <GameStatus
                    message={`Waiting for ${opponentPlayerName || 'opponent'} to confirm their selection...`}
                    type="waiting"
                    showSpinner={true}
                    size="lg"
                />
            </div>
        );
    }

    if (opponentHasConfirmed && hasConfirmedSelection) {
        return (
            <div className="mt-6">
                <GameStatus
                    message={`${opponentPlayerName || 'Opponent'} has confirmed! Both players ready!`}
                    type="success"
                    size="lg"
                />
            </div>
        );
    }

    return null;
}; 