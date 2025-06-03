import React from 'react';

interface SelectionControlsProps {
    canConfirm: boolean;
    canReset: boolean;
    onConfirm: () => void;
    onReset: () => void;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
    canConfirm,
    canReset,
    onConfirm,
    onReset
}) => {
    return (
        <div className="mt-8 flex space-x-6">
            <button
                className="btn btn-primary"
                disabled={!canConfirm}
                onClick={onConfirm}
            >
                Confirm Selection
            </button>
            <button
                className="btn btn-danger"
                onClick={onReset}
                disabled={!canReset}
            >
                Reset
            </button>
        </div>
    );
}; 