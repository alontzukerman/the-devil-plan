import { Server as SocketIOServer } from 'socket.io';
import { Game, ServerCard } from '../types';
import { GAME_CONSTANTS } from '../constants/game.constants';
import { validateTruthGuess } from '../utils/validation';

export class TruthService {
    constructor(private io: SocketIOServer, private biddingService: any) { }

    submitTruthGuess(game: Game, guess: ServerCard[], guesserPlayerId: string): boolean {
        const guesser = game.players.find(p => p.id === guesserPlayerId);

        if (!game || !guesser || game.currentPhase !== 'truthGuessing' || guesserPlayerId !== game.currentBidWinnerId) {
            console.error(`Invalid truth guess from ${guesserPlayerId} for game ${game.id}. Conditions not met.`);
            return false;
        }

        const target = game.players.find(p => p.id !== guesserPlayerId);
        if (!target) {
            console.error(`Critical: Target player not found for guess in game ${game.id}`);
            return false;
        }

        const targetActualSeries = game.playerSelectedSeries[target.id];
        if (!targetActualSeries || targetActualSeries.length !== 8) {
            console.error(`Critical: Target series not found or invalid for game ${game.id}`);
            return false;
        }

        if (!validateTruthGuess(guess)) {
            console.warn(`Invalid guess received from ${guesser.name} for game ${game.id}: series length not 8.`);
            this.io.to(game.id).emit('truthGuessResult', {
                gameId: game.id,
                wasGuessCorrect: false
            });
            console.log(`Guess by ${guesser.name} was incorrect (invalid length). Game ${game.id} continues.`);
            setTimeout(() => this.biddingService.startBiddingPhase(game), GAME_CONSTANTS.BID_TIED_RESTART_DELAY);
            return false;
        }

        console.log(`Player ${guesser.name} in game ${game.id} submitted guess for ${target.name}'s series.`);

        const isCorrect = this.compareSeriesForCorrectness(guess, targetActualSeries);

        if (isCorrect) {
            console.log(`Guess by ${guesser.name} for game ${game.id} was CORRECT! Winner: ${guesser.name}`);
            game.currentPhase = 'gameOver';
            this.io.to(game.id).emit('truthGuessResult', {
                gameId: game.id,
                wasGuessCorrect: true,
                winnerId: guesser.id,
                winnerName: guesser.name
            });
        } else {
            console.log(`Guess by ${guesser.name} for game ${game.id} was INCORRECT.`);
            this.io.to(game.id).emit('truthGuessResult', {
                gameId: game.id,
                wasGuessCorrect: false
            });
            console.log(`Game ${game.id} continues. Starting new bidding round shortly.`);
            setTimeout(() => this.biddingService.startBiddingPhase(game), GAME_CONSTANTS.TRUTH_GUESS_DELAY);
        }

        return true;
    }

    private compareSeriesForCorrectness(guess: ServerCard[], actual: ServerCard[]): boolean {
        if (guess.length !== actual.length) return false;

        for (let i = 0; i < 8; i++) {
            if (guess[i].suit !== actual[i].suit || guess[i].rank !== actual[i].rank) {
                return false;
            }
        }

        return true;
    }
} 