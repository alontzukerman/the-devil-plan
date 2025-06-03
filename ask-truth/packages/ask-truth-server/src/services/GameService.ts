import { Game, Player, ServerCard } from '../types';
import { GAME_CONSTANTS } from '../constants/game.constants';
import { generateGameId } from '../utils/gameUtils';

export class GameService {
    private games: Record<string, Game> = {};

    createGame(playerId: string, playerName: string): { gameId: string; game: Game } {
        const gameId = generateGameId();
        const newPlayer: Player = { id: playerId, name: playerName };

        const game: Game = {
            id: gameId,
            players: [newPlayer],
            playerSelectedSeries: {},
            playerCoins: {},
            currentBids: {},
            bidsSubmittedThisRound: new Set(),
            playersReadyForBidding: new Set(),
            currentPhase: 'cardSelection',
            askedQuestions: [],
        };

        this.games[gameId] = game;
        console.log(`Player ${playerName} (${playerId}) created game ${gameId}`);

        return { gameId, game };
    }

    joinGame(gameId: string, playerId: string, playerName: string): { success: boolean; game?: Game; error?: string } {
        const game = this.games[gameId];

        if (!game) {
            return { success: false, error: 'Game ID not found.' };
        }

        if (game.players.length >= 2 && !game.players.find(p => p.id === playerId)) {
            return { success: false, error: 'Game is full.' };
        }

        // Check if player is already in the game (reconnection)
        if (!game.players.find(p => p.id === playerId)) {
            const newPlayer: Player = { id: playerId, name: playerName };
            game.players.push(newPlayer);
        }

        // Initialize coins for both players when game is full
        if (game.players.length === 2) {
            const player1 = game.players[0];
            const player2 = game.players[1];
            game.playerCoins[player1.id] = GAME_CONSTANTS.STARTING_COINS;
            game.playerCoins[player2.id] = GAME_CONSTANTS.STARTING_COINS;
            console.log(`Initialized coins for game ${gameId}: ${player1.name}=${GAME_CONSTANTS.STARTING_COINS}, ${player2.name}=${GAME_CONSTANTS.STARTING_COINS}`);
        }

        console.log(`Player ${playerName} (${playerId}) joined game ${gameId}`);
        return { success: true, game };
    }

    getGame(gameId: string): Game | undefined {
        return this.games[gameId];
    }

    getAllGames(): Record<string, Game> {
        return this.games;
    }

    deleteGame(gameId: string): void {
        delete this.games[gameId];
        console.log(`Game ${gameId} deleted.`);
    }

    setPlayerSeries(gameId: string, playerId: string, series: ServerCard[]): boolean {
        const game = this.games[gameId];
        if (!game) return false;

        game.playerSelectedSeries[playerId] = series;
        console.log(`Player (${playerId}) in game ${gameId} confirmed series.`);
        return true;
    }

    areAllPlayersReady(gameId: string): boolean {
        const game = this.games[gameId];
        if (!game || game.players.length !== 2) return false;

        return game.players.every(player =>
            game.playerSelectedSeries[player.id] &&
            game.playerSelectedSeries[player.id].length === 8
        );
    }

    transitionToBidding(gameId: string): boolean {
        const game = this.games[gameId];
        if (!game) return false;

        game.currentPhase = 'bidding';
        game.playersReadyForBidding.clear();
        console.log(`Game ${gameId} transitioned to bidding phase.`);
        return true;
    }

    removePlayer(gameId: string, playerId: string): { shouldDeleteGame: boolean; remainingPlayer?: Player } {
        const game = this.games[gameId];
        if (!game) return { shouldDeleteGame: false };

        const playerIndex = game.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return { shouldDeleteGame: false };

        const playerName = game.players[playerIndex].name;
        game.players.splice(playerIndex, 1);

        // Clean up player data
        delete game.playerSelectedSeries[playerId];
        delete game.playerCoins[playerId];
        delete game.currentBids[playerId];
        game.bidsSubmittedThisRound.delete(playerId);
        game.playersReadyForBidding.delete(playerId);

        console.log(`Player ${playerName} (${playerId}) left game ${gameId}`);

        if (game.players.length === 0) {
            this.deleteGame(gameId);
            return { shouldDeleteGame: true };
        }

        return { shouldDeleteGame: false, remainingPlayer: game.players[0] };
    }
} 