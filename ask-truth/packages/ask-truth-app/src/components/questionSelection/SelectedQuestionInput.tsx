import React from 'react';
import QuestionInputRenderer from '../QuestionInputRenderer';
import type { SelectedQuestionInputProps } from '../../utils/types/questionSelection.types';

export const SelectedQuestionInput: React.FC<SelectedQuestionInputProps> = ({
    question,
    currentParams,
    onParamsChange,
    isSubmitting
}) => {
    if (!question.requiresInput || question.requiresInput === 'NONE') {
        return null;
    }

    return (
        <div className="my-6 p-4 bg-neutral-600 rounded-lg">
            <h3 className="text-xl font-semibold text-info mb-3">
                Provide Input for: <span className="text-secondary-300">{question.text}</span>
            </h3>
            <QuestionInputRenderer
                question={question}
                currentParams={currentParams}
                onParamsChange={onParamsChange}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}; 