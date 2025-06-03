import React from 'react';
import { Button } from '@ask-truth/ui';
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
        <Button
            onClick={onSubmit}
            disabled={isDisabled}
            variant="primary"
            fullWidth
            loading={isSubmitting}
            size="lg"
            className="mt-4 disabled:opacity-70"
        >
            {getButtonText()}
        </Button>
    );
}; 