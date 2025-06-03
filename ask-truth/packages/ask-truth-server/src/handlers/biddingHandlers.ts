import { Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { BiddingService } from '../services/BiddingService';
import { validateGame, validatePlayer } from '../utils/validation';

export const createBiddingHandlers = (
    gameService: GameService,
    biddingService: BiddingService
) => {
    const submitFinalBid = (socket: Socket) => {
        socket.on('submitFinalBid', ({ gameId, bidAmount }: { gameId: string, bidAmount: number }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);
            const player = game ? validatePlayer(game, socket.id) : null;

            if (!game || !player) {
                socket.emit('gameError', { message: 'Error submitting bid: Invalid game or player.' });
                return;
            }

            const success = biddingService.submitBid(game, socket.id, bidAmount);

            if (success && game.bidsSubmittedThisRound.size === 2) {
                biddingService.resolveBids(game);
            }
        });
    };

    return {
        submitFinalBid
    };
}; 