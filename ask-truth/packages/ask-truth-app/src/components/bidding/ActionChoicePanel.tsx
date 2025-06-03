import React from 'react';
import { Button } from '@ask-truth/ui';

interface ActionChoicePanelProps {
    canChooseAction: boolean;
    onChooseAction: (action: 'Ask' | 'Truth') => void;
}

export const ActionChoicePanel: React.FC<ActionChoicePanelProps> = ({
    canChooseAction,
    onChooseAction
}) => {
    if (!canChooseAction) {
        return null;
    }

    return (
        <div className="mt-6 p-6 bg-slate-600 rounded-lg">
            <h3 className="text-2xl font-semibold text-center text-amber-300 mb-4">
                Choose Your Action
            </h3>
            <div className="flex flex-col sm:flex-row justify-around items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                    onClick={() => onChooseAction('Ask')}
                    variant="primary"
                    size="xl"
                    className="w-full sm:w-auto"
                >
                    Ask a Question
                </Button>
                <Button
                    onClick={() => onChooseAction('Truth')}
                    variant="secondary"
                    size="xl"
                    className="w-full sm:w-auto"
                >
                    Guess Their Truth
                </Button>
            </div>
        </div>
    );
}; 