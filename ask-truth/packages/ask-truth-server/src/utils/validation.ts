import { Game, Player, ServerCard } from '../types';

export const validateGame = (game: Game | undefined, gameId: string): Game | null => {
    if (!game) {
        console.error(`Game ${gameId} not found`);
        return null;
    }
    return game;
};

export const validatePlayer = (game: Game, socketId: string): Player | null => {
    const player = game.players.find(p => p.id === socketId);
    if (!player) {
        console.error(`Player ${socketId} not found in game ${game.id}`);
        return null;
    }
    return player;
};

export const validateTruthGuess = (guess: ServerCard[]): boolean => {
    return guess && guess.length === 8;
};

export const validateBidAmount = (bidAmount: number, availableCoins: number): number => {
    return Math.max(0, Math.min(bidAmount, availableCoins));
}; 