import React from 'react';

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
            <button
                onClick={onConfirm}
                disabled={!canConfirm}
                className="btn btn-primary"
            >
                Confirm Guess
            </button>
            <button
                onClick={onReset}
                disabled={!canReset}
                className="btn btn-danger"
            >
                Reset Guess
            </button>
        </div>
    );
}; 