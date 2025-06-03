import { useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { QuestionSelectionState } from '../../utils/types/questionSelection.types';

interface UseQuestionSubmissionProps {
    socket: Socket | null;
    gameId: string | undefined;
    state: QuestionSelectionState;
    setState: React.Dispatch<React.SetStateAction<QuestionSelectionState>>;
}

export const useQuestionSubmission = ({
    socket,
    gameId,
    state,
    setState
}: UseQuestionSubmissionProps) => {
    const validateSubmission = useCallback((): string | null => {
        if (!state.selectedQuestionId || !state.selectedQuestionFull || !gameId || !socket) {
            return 'Please select a question first.';
        }

        if (state.isSubmitting || state.showAnswer) {
            return 'Submission already in progress or completed.';
        }

        // Validate required inputs
        if (state.selectedQuestionFull.requiresInput && state.selectedQuestionFull.requiresInput !== 'NONE') {
            if (state.selectedQuestionFull.requiresInput === 'CARD_POSITIONS') {
                if (!state.inputParams.positions || state.inputParams.positions.length !== state.selectedQuestionFull.numberOfInputs) {
                    return `Please select exactly ${state.selectedQuestionFull.numberOfInputs} card positions.`;
                }
            }
            // Add more validation for other input types here as they are implemented
        }

        return null; // No validation errors
    }, [state, gameId, socket]);

    const handleSubmitQuestion = useCallback(() => {
        const validationError = validateSubmission();
        if (validationError) {
            console.error('useQuestionSubmission: Cannot submit question:', validationError);
            setState(prev => ({
                ...prev,
                submissionError: validationError
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            isSubmitting: true,
            submissionError: null
        }));

        console.log(`useQuestionSubmission: Player selected question: ${state.selectedQuestionId} for game ${gameId} with params:`, state.inputParams);

        socket!.emit('playerSelectedQuestion', {
            gameId,
            questionId: state.selectedQuestionId,
            params: (state.selectedQuestionFull!.requiresInput && state.selectedQuestionFull!.requiresInput !== 'NONE')
                ? state.inputParams
                : undefined
        });
    }, [validateSubmission, setState, state.selectedQuestionId, state.selectedQuestionFull, state.inputParams, gameId, socket]);

    const canSubmit = !state.isSubmitting &&
        !!state.selectedQuestionId &&
        !state.showAnswer;

    return {
        handleSubmitQuestion,
        canSubmit,
        validateSubmission
    };
}; 