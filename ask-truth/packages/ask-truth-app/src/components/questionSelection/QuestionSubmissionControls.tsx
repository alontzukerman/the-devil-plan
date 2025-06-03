import React from 'react';
import type { QuestionSubmissionControlsProps } from '../../utils/types/questionSelection.types';

export const QuestionSubmissionControls: React.FC<QuestionSubmissionControlsProps> = ({
    canSubmit,
    isSubmitting,
    showAnswer,
    onSubmit
}) => {
    const getButtonText = () => {
        if (isSubmitting) return 'Submitting...';
        if (showAnswer) return 'Answer Received';
        return 'Submit Question';
    };

    const isDisabled = !canSubmit || isSubmitting || showAnswer;

    return (
        <button
            onClick={onSubmit}
            disabled={isDisabled}
            className="btn btn-primary w-full py-3 text-lg disabled:opacity-70 mt-4"
        >
            {getButtonText()}
        </button>
    );
}; 