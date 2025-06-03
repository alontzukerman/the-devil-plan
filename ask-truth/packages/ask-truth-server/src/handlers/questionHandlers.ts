import { Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { QuestionService } from '../services/QuestionService';
import { validateGame } from '../utils/validation';

export const createQuestionHandlers = (
    gameService: GameService,
    questionService: QuestionService
) => {
    const playerMadeChoice = (socket: Socket) => {
        socket.on('playerMadeChoice', ({ gameId, choice }: { gameId: string, choice: 'Truth' | 'Ask' }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);

            if (!game) {
                socket.emit('errorToClient', { message: "Game not found." });
                return;
            }

            const success = questionService.handlePlayerChoice(game, choice, socket.id);

            if (!success) {
                socket.emit('errorToClient', { message: "It's not your turn to make a choice." });
            }
        });
    };

    const playerSelectedQuestion = (socket: Socket) => {
        socket.on('playerSelectedQuestion', ({ gameId, questionId, params }: { gameId: string, questionId: string, params?: any }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);

            if (!game) {
                socket.emit('errorToClient', { message: "Game not found." });
                return;
            }

            const success = questionService.processQuestionSelection(game, questionId, params, socket.id);

            if (!success) {
                socket.emit('errorToClient', { message: "Cannot select question now or invalid question/parameters." });
            }
        });
    };

    return {
        playerMadeChoice,
        playerSelectedQuestion
    };
}; 