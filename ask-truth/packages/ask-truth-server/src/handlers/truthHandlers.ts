import { Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { TruthService } from '../services/TruthService';
import { validateGame } from '../utils/validation';
import { ServerCard } from '../types';

export const createTruthHandlers = (
    gameService: GameService,
    truthService: TruthService
) => {
    const submitTruthGuess = (socket: Socket) => {
        socket.on('submitTruthGuess', ({ gameId, guess }: { gameId: string, guess: ServerCard[] }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);

            if (!game) {
                socket.emit('gameError', { message: 'Game not found.' });
                return;
            }

            const success = truthService.submitTruthGuess(game, guess, socket.id);

            if (!success) {
                socket.emit('gameError', { message: 'Cannot submit guess at this time.' });
            }
        });
    };

    return {
        submitTruthGuess
    };
}; 