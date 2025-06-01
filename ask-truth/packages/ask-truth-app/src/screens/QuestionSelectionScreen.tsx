import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import {
    PREDEFINED_QUESTIONS,
    type Question,
    type QuestionId,
    type QuestionInputParameters,
    type ClientAskedQuestionInfo
} from '../utils/questions';
import QuestionListItem from '../components/QuestionListItem';
import QuestionInputRenderer from '../components/QuestionInputRenderer';

const QUESTION_DISPLAY_DURATION = 4000;

export const QuestionSelectionScreen: React.FC = () => {
    const { socket } = useSocket();
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    const [selectedQuestionId, setSelectedQuestionId] = useState<QuestionId | null>(null);
    const [selectedQuestionFull, setSelectedQuestionFull] = useState<Question | null>(null);
    const [inputParams, setInputParams] = useState<QuestionInputParameters>({});

    const [showAnswer, setShowAnswer] = useState<ClientAskedQuestionInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSelectQuestion = (questionId: QuestionId) => {
        if (isSubmitting || showAnswer) return;
        const questionDetails = PREDEFINED_QUESTIONS.find(q => q.id === questionId) || null;
        setSelectedQuestionId(questionId);
        setSelectedQuestionFull(questionDetails);
        setInputParams({}); // Reset input params when a new question is selected
        setSubmissionError(null); // Clear previous errors
    };

    const handleSubmitQuestion = () => {
        if (!selectedQuestionId || !selectedQuestionFull || !gameId || !socket || isSubmitting || showAnswer) {
            console.error('Cannot submit question: Pre-conditions not met.', { selectedQuestionId, gameId, socket, isSubmitting, showAnswer });
            setSubmissionError('Please select a question first.');
            return;
        }

        // Basic validation for required inputs before submitting
        if (selectedQuestionFull.requiresInput && selectedQuestionFull.requiresInput !== 'NONE') {
            if (selectedQuestionFull.requiresInput === 'CARD_POSITIONS') {
                if (!inputParams.positions || inputParams.positions.length !== selectedQuestionFull.numberOfInputs) {
                    setSubmissionError(`Please select exactly ${selectedQuestionFull.numberOfInputs} card positions.`);
                    return;
                }
            }
            // Add more validation for other input types here as they are implemented
        }

        setIsSubmitting(true);
        setSubmissionError(null);
        console.log(`Player selected question: ${selectedQuestionId} for game ${gameId} with params:`, inputParams);
        socket.emit('playerSelectedQuestion', {
            gameId,
            questionId: selectedQuestionId,
            params: (selectedQuestionFull.requiresInput && selectedQuestionFull.requiresInput !== 'NONE') ? inputParams : undefined
        });
    };

    useEffect(() => {
        if (!socket || !gameId) return;

        const handleQuestionAnswered = (data: ClientAskedQuestionInfo & { gameId: string }) => {
            if (data.gameId === gameId && socket && data.askedByPlayerId === socket.id) {
                console.log('QuestionSelectionScreen: Received answer to my question', data);
                setShowAnswer(data);
                setIsSubmitting(false); // Allow re-interaction or just display
                setTimeout(() => {
                    if (gameId) {
                        console.log('QuestionSelectionScreen: Display timer ended, navigating to bidding screen.');
                        navigate(`/game/${gameId}/bidding`);
                    }
                }, QUESTION_DISPLAY_DURATION);
            }
        };

        const handleErrorToClient = (data: { message: string }) => {
            console.error('Server error on QuestionSelectionScreen:', data.message);
            setSubmissionError(data.message);
            setIsSubmitting(false); // Re-enable submission button if server rejected due to params etc.
        };

        socket.on('questionAnswered', handleQuestionAnswered);
        socket.on('errorToClient', handleErrorToClient);

        return () => {
            socket.off('questionAnswered', handleQuestionAnswered);
            socket.off('errorToClient', handleErrorToClient);
        };
    }, [socket, gameId, navigate]);

    if (showAnswer) {
        // ... (UI for showing answer - needs to handle different answer types, e.g. number or boolean)
        const answerDisplay = typeof showAnswer.answer === 'boolean'
            ? (showAnswer.answer ? 'TRUE' : 'FALSE')
            : String(showAnswer.answer);
        return (
            <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-slate-700 p-8 rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-cinzel-decorative text-amber-400 mb-6">
                        Question Asked
                    </h1>
                    <p className="text-lg text-sky-200 mb-1">Your question:</p>
                    <p className="text-xl font-semibold text-white mb-2">"{showAnswer.questionText}"</p>
                    {showAnswer.params && Object.keys(showAnswer.params).length > 0 && (
                        <p className="text-sm text-gray-400 mb-4">Your input: {JSON.stringify(showAnswer.params)}</p>
                    )}
                    <p className="text-lg text-sky-200 mb-3">The answer is:</p>
                    <p className={`text-4xl font-bold mb-8 ${typeof showAnswer.answer === 'boolean' ? (showAnswer.answer ? 'text-green-400' : 'text-red-400') : 'text-yellow-300'}`}>
                        {answerDisplay}
                    </p>
                    <p className="text-sm text-gray-400">Returning to bidding screen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center p-6 pt-12">
            <div className="w-full max-w-3xl bg-slate-700 p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-cinzel-decorative text-center text-amber-400 mb-8">
                    Select a Question to Ask
                </h1>

                <div className="space-y-3 mb-6">
                    {PREDEFINED_QUESTIONS.map((question) => (
                        <QuestionListItem
                            key={question.id}
                            question={question}
                            isSelected={selectedQuestionId === question.id}
                            onSelect={handleSelectQuestion}
                            isSubmitted={isSubmitting || !!showAnswer}
                        />
                    ))}
                </div>

                {selectedQuestionFull && selectedQuestionFull.requiresInput && selectedQuestionFull.requiresInput !== 'NONE' && !showAnswer && (
                    <div className="my-6 p-4 bg-slate-600 rounded-lg">
                        <h3 className="text-xl font-semibold text-sky-300 mb-3">
                            Provide Input for: <span className="text-amber-300">{selectedQuestionFull.text}</span>
                        </h3>
                        <QuestionInputRenderer
                            question={selectedQuestionFull}
                            currentParams={inputParams}
                            onParamsChange={setInputParams}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}

                {submissionError && (
                    <p className="text-red-400 text-center my-4 p-2 bg-red-900/50 rounded">Error: {submissionError}</p>
                )}

                <button
                    onClick={handleSubmitQuestion}
                    disabled={!selectedQuestionId || isSubmitting || !!showAnswer}
                    className="btn btn-primary w-full py-3 text-lg disabled:opacity-70 mt-4"
                >
                    {isSubmitting ? 'Submitting...' : (showAnswer ? 'Answer Received' : 'Submit Question')}
                </button>
            </div>
        </div>
    );
}; 