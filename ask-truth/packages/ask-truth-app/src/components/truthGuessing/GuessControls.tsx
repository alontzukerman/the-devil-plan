import React from 'react';
import { Button } from '@ask-truth/ui';

interface GuessControlsProps {
    canConfirm: boolean;
    canReset: boolean;
    onConfirm: () => void;
    onReset: () => void;
}

export const GuessControls: React.FC<GuessControlsProps> = ({
    canConfirm,
    canReset,
    onConfirm,
    onReset
}) => {
    return (
        <div className="my-4 flex space-x-4">
            <Button
                onClick={onConfirm}
                disabled={!canConfirm}
                variant="primary"
            >
                Confirm Guess
            </Button>
            <Button
                onClick={onReset}
                disabled={!canReset}
                variant="danger"
            >
                Reset Guess
            </Button>
        </div>
    );
}; 