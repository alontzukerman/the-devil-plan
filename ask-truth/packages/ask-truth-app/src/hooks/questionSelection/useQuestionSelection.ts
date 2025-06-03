import { useCallback } from 'react';
import { PREDEFINED_QUESTIONS } from '../../utils/questions';
import type { QuestionId, QuestionInputParameters } from '../../utils/questions';
import type { QuestionSelectionState } from '../../utils/types/questionSelection.types';

interface UseQuestionSelectionProps {
    state: QuestionSelectionState;
    setState: React.Dispatch<React.SetStateAction<QuestionSelectionState>>;
}

export const useQuestionSelection = ({ state, setState }: UseQuestionSelectionProps) => {
    const handleSelectQuestion = useCallback((questionId: QuestionId) => {
        if (state.isSubmitting || state.showAnswer) return;

        const questionDetails = PREDEFINED_QUESTIONS.find(q => q.id === questionId) || null;

        setState(prev => ({
            ...prev,
            selectedQuestionId: questionId,
            selectedQuestionFull: questionDetails,
            inputParams: {}, // Reset input params when a new question is selected
            submissionError: null // Clear previous errors
        }));
    }, [state.isSubmitting, state.showAnswer, setState]);

    const handleParamsChange = useCallback((newParams: QuestionInputParameters) => {
        setState(prev => ({
            ...prev,
            inputParams: newParams,
            submissionError: null // Clear errors when user changes input
        }));
    }, [setState]);

    return {
        handleSelectQuestion,
        handleParamsChange
    };
}; 