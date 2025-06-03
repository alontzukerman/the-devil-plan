import React from 'react';
import { Button } from '@ask-truth/ui';

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
            <Button
                variant="primary"
                disabled={!canConfirm}
                onClick={onConfirm}
            >
                Confirm Selection
            </Button>
            <Button
                variant="danger"
                onClick={onReset}
                disabled={!canReset}
            >
                Reset
            </Button>
        </div>
    );
}; 