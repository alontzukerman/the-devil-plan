import { Server as SocketIOServer } from 'socket.io';
import { Game } from '../types';
import { GAME_CONSTANTS } from '../constants/game.constants';
import { validateBidAmount } from '../utils/validation';

export class BiddingService {
    constructor(private io: SocketIOServer) { }

    startBiddingPhase(game: Game): void {
        if (!game || game.players.length !== 2) {
            console.error(`Cannot start bidding phase for game ${game?.id}: invalid game state.`);
            return;
        }

        console.log(`[startBiddingPhase] Clearing playersReadyForBidding for game ${game.id} before starting new bid round.`);
        game.playersReadyForBidding.clear();

        game.currentPhase = 'bidding';
        console.log(`Starting bidding phase for game ${game.id}. Total asked questions in game: ${game.askedQuestions.length}`);
        game.currentBids = {};
        game.bidsSubmittedThisRound = new Set();

        game.players.forEach(player => {
            const opponent = game.players.find(p => p.id !== player.id);
            if (!opponent) return;

            // Filter asked questions to only include those asked by the current player
            const playerSpecificAskedQuestions = game.askedQuestions.filter(
                q => q.askedByPlayerId === player.id
            );

            this.io.to(player.id).emit('biddingPhaseState', {
                gameId: game.id,
                myPlayerId: player.id,
                myPlayerName: player.name,
                myInitialCoins: game.playerCoins[player.id],
                opponentName: opponent.name,
                opponentLowCoins: game.playerCoins[opponent.id] <= GAME_CONSTANTS.LOW_COIN_THRESHOLD,
                timerDuration: GAME_CONSTANTS.BIDDING_TIMER_DURATION,
                askedQuestionsHistory: playerSpecificAskedQuestions,
            });
        });
    }

    submitBid(game: Game, playerId: string, bidAmount: number): boolean {
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
            console.error(`Player ${playerId} not found in game ${game.id}`);
            return false;
        }

        if (game.bidsSubmittedThisRound.has(playerId)) {
            console.warn(`Player ${player.name} (${playerId}) tried to submit bid multiple times for game ${game.id}. Ignoring.`);
            return false;
        }

        // Validate bid amount server-side
        const actualBidAmount = validateBidAmount(bidAmount, game.playerCoins[playerId]);
        if (actualBidAmount !== bidAmount) {
            console.warn(`Player ${player.name} (${playerId}) submitted invalid bid ${bidAmount}, adjusted to ${actualBidAmount}. Coins: ${game.playerCoins[playerId]}`);
        }

        game.currentBids[playerId] = actualBidAmount;
        game.bidsSubmittedThisRound.add(playerId);
        console.log(`Player ${player.name} (${playerId}) submitted final bid of ${actualBidAmount} for game ${game.id}.`);

        const opponent = game.players.find(p => p.id !== playerId);
        if (opponent && !game.bidsSubmittedThisRound.has(opponent.id)) {
            this.io.to(opponent.id).emit('opponentHasBidNotification');
        }

        return true;
    }

    resolveBids(game: Game): void {
        if (game.players.length !== 2 || game.bidsSubmittedThisRound.size !== 2) {
            console.error(`Cannot resolve bids for game ${game.id}: not all bids submitted or invalid player count. Submitted: ${game.bidsSubmittedThisRound.size}`);
            return;
        }

        console.log(`Resolving bids for game ${game.id}. Bids:`, game.currentBids);

        const [player1, player2] = game.players;
        const bid1 = game.currentBids[player1.id] ?? 0;
        const bid2 = game.currentBids[player2.id] ?? 0;

        let winnerId: string | undefined = undefined;
        let winnerName: string | undefined = undefined;
        let bidsTied = false;

        if (bid1 > bid2) {
            winnerId = player1.id;
            winnerName = player1.name;
        } else if (bid2 > bid1) {
            winnerId = player2.id;
            winnerName = player2.name;
        } else {
            bidsTied = true;
        }

        game.currentBidWinnerId = winnerId;

        // Update coin totals: Subtract bids, then add awarded coins
        game.playerCoins[player1.id] = (game.playerCoins[player1.id] - bid1) + GAME_CONSTANTS.COINS_AWARDED_PER_ROUND;
        game.playerCoins[player2.id] = (game.playerCoins[player2.id] - bid2) + GAME_CONSTANTS.COINS_AWARDED_PER_ROUND;

        console.log(`Bids resolved for ${game.id}. Winner: ${winnerName || (bidsTied ? 'Tied' : 'None')}. New coins: P1=${game.playerCoins[player1.id]}, P2=${game.playerCoins[player2.id]}`);

        // Emit results to each player
        game.players.forEach(player => {
            const opponent = game.players.find(p => p.id !== player.id);
            if (!opponent) return;

            this.io.to(player.id).emit('biddingResolved', {
                winnerId,
                winnerName,
                bidsTied,
                yourNewCoinTotal: game.playerCoins[player.id],
                opponentNewLowCoinsStatus: game.playerCoins[opponent.id] <= GAME_CONSTANTS.LOW_COIN_THRESHOLD,
            });
        });

        if (bidsTied) {
            console.log(`Bids tied in game ${game.id}. Starting new bidding round shortly.`);
            setTimeout(() => this.startBiddingPhase(game), GAME_CONSTANTS.BID_TIED_RESTART_DELAY);
        } else {
            console.log(`Game ${game.id} waiting for ${winnerName} (${winnerId}) to choose Ask or Truth.`);
            if (winnerId) {
                this.io.to(winnerId).emit('enableActionChoice', { gameId: game.id });
            }
        }
    }

    markPlayerReadyForBidding(game: Game, playerId: string): boolean {
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
            console.error(`Player ${playerId} not found in game ${game.id}`);
            return false;
        }

        console.log(`Player ${player.name} (${playerId}) is ready for bidding in game ${game.id}.`);
        game.playersReadyForBidding.add(playerId);

        if (game.players.length === 2 && game.playersReadyForBidding.size === 2) {
            console.log(`Both players in game ${game.id} are ready for bidding. Starting phase.`);
            this.startBiddingPhase(game);
            game.playersReadyForBidding.clear();
            return true;
        }

        return false;
    }
} 