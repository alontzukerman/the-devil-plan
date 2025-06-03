import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { PREDEFINED_QUESTIONS } from '../utils/questions';
import { useQuestionSelectionSocket } from '../hooks/questionSelection/useQuestionSelectionSocket';
import { useQuestionSelection } from '../hooks/questionSelection/useQuestionSelection';
import { useQuestionSubmission } from '../hooks/questionSelection/useQuestionSubmission';
import { QuestionSelectionHeader } from '../components/questionSelection/QuestionSelectionHeader';
import { QuestionsList } from '../components/questionSelection/QuestionsList';
import { SelectedQuestionInput } from '../components/questionSelection/SelectedQuestionInput';
import { ErrorDisplay } from '../components/questionSelection/ErrorDisplay';
import { QuestionSubmissionControls } from '../components/questionSelection/QuestionSubmissionControls';
import { AnswerDisplay } from '../components/questionSelection/AnswerDisplay';
import type { QuestionSelectionState } from '../utils/types/questionSelection.types';

export const QuestionSelectionScreen: React.FC = () => {
    const { socket } = useSocket();
    const { gameId } = useParams<{ gameId: string }>();

    // Combined state
    const [state, setState] = useState<QuestionSelectionState>({
        selectedQuestionId: null,
        selectedQuestionFull: null,
        inputParams: {},
        showAnswer: null,
        isSubmitting: false,
        submissionError: null
    });

    // Custom hooks
    useQuestionSelectionSocket({
        socket,
        gameId,
        setState
    });

    const { handleSelectQuestion, handleParamsChange } = useQuestionSelection({
        state,
        setState
    });

    const { handleSubmitQuestion, canSubmit } = useQuestionSubmission({
        socket,
        gameId,
        state,
        setState
    });

    // Show answer display if we have an answer
    if (state.showAnswer) {
        return <AnswerDisplay answerData={state.showAnswer} onNavigateBack={() => { }} />;
    }

    // Main question selection UI
    return (
        <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center p-6 pt-12">
            <div className="w-full max-w-3xl bg-slate-700 p-8 rounded-lg shadow-xl">
                <QuestionSelectionHeader />

                <QuestionsList
                    questions={PREDEFINED_QUESTIONS}
                    selectedQuestionId={state.selectedQuestionId}
                    onSelectQuestion={handleSelectQuestion}
                    isDisabled={state.isSubmitting || !!state.showAnswer}
                />

                {state.selectedQuestionFull && (
                    <SelectedQuestionInput
                        question={state.selectedQuestionFull}
                        currentParams={state.inputParams}
                        onParamsChange={handleParamsChange}
                        isSubmitting={state.isSubmitting}
                    />
                )}

                <ErrorDisplay error={state.submissionError} />

                <QuestionSubmissionControls
                    canSubmit={canSubmit}
                    isSubmitting={state.isSubmitting}
                    showAnswer={!!state.showAnswer}
                    onSubmit={handleSubmitQuestion}
                />
            </div>
        </div>
    );
}; 