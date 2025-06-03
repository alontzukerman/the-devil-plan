import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type {
    QuestionAnsweredData,
    ErrorToClientData,
    QuestionSelectionState
} from '../../utils/types/questionSelection.types';

interface UseQuestionSelectionSocketProps {
    socket: Socket | null;
    gameId: string | undefined;
    setState: React.Dispatch<React.SetStateAction<QuestionSelectionState>>;
    questionDisplayDuration?: number;
}

export const useQuestionSelectionSocket = ({
    socket,
    gameId,
    setState,
    questionDisplayDuration = 4000
}: UseQuestionSelectionSocketProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket || !gameId) return;

        const handleQuestionAnswered = (data: QuestionAnsweredData) => {
            if (data.gameId === gameId && socket && data.askedByPlayerId === socket.id) {
                console.log('useQuestionSelectionSocket: Received answer to my question', data);

                setState(prev => ({
                    ...prev,
                    showAnswer: data,
                    isSubmitting: false
                }));

                // Auto-navigate back to bidding after display duration
                setTimeout(() => {
                    if (gameId) {
                        console.log('useQuestionSelectionSocket: Display timer ended, navigating to bidding screen.');
                        navigate(`/game/${gameId}/bidding`);
                    }
                }, questionDisplayDuration);
            }
        };

        const handleErrorToClient = (data: ErrorToClientData) => {
            console.error('useQuestionSelectionSocket: Server error:', data.message);
            setState(prev => ({
                ...prev,
                submissionError: data.message,
                isSubmitting: false
            }));
        };

        socket.on('questionAnswered', handleQuestionAnswered);
        socket.on('errorToClient', handleErrorToClient);

        return () => {
            socket.off('questionAnswered', handleQuestionAnswered);
            socket.off('errorToClient', handleErrorToClient);
        };
    }, [socket, gameId, navigate, setState, questionDisplayDuration]);
}; 