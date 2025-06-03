import { Socket, Server as SocketIOServer } from 'socket.io';
import { GameService } from '../services/GameService';
import { BiddingService } from '../services/BiddingService';
import { validateGame, validatePlayer } from '../utils/validation';
import { ServerCard } from '../types';

export const createGameHandlers = (
    io: SocketIOServer,
    gameService: GameService,
    biddingService: BiddingService
) => {
    const createGame = (socket: Socket) => {
        socket.on('createGame', ({ playerName }: { playerName: string }) => {
            const { gameId, game } = gameService.createGame(socket.id, playerName);
            socket.join(gameId);
            socket.emit('gameCreated', { gameId, playerId: socket.id, players: game.players });
            socket.emit('updatePlayerNames', {
                currentPlayerName: playerName,
                opponentPlayerName: 'Waiting for opponent...'
            });
        });
    };

    const joinGame = (socket: Socket) => {
        socket.on('joinGame', ({ gameId, playerName }: { gameId: string, playerName: string }) => {
            const result = gameService.joinGame(gameId, socket.id, playerName);

            if (!result.success) {
                socket.emit('gameJoinError', { message: result.error });
                return;
            }

            const game = result.game!;
            socket.join(gameId);
            console.log(`Player ${playerName} (${socket.id}) joined game ${gameId}`);
            io.to(gameId).emit('playerJoined', { gameId, players: game.players });

            if (game.players.length === 2) {
                const player1 = game.players[0];
                const player2 = game.players[1];

                io.to(player1.id).emit('updatePlayerNames', {
                    currentPlayerName: player1.name,
                    opponentPlayerName: player2.name
                });
                io.to(player2.id).emit('updatePlayerNames', {
                    currentPlayerName: player2.name,
                    opponentPlayerName: player1.name
                });

                handleGameNavigation(game, io);
            }
        });
    };

    const playerSelectedSeries = (socket: Socket) => {
        socket.on('playerSelectedSeries', ({ gameId, series }: { gameId: string, series: ServerCard[] }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);
            const player = game ? validatePlayer(game, socket.id) : null;

            if (!game || !player) {
                socket.emit('gameError', { message: 'Error selecting series: Invalid game or player.' });
                return;
            }

            gameService.setPlayerSeries(gameId, socket.id, series);

            const opponent = game.players.find(p => p.id !== socket.id);
            if (opponent) {
                io.to(opponent.id).emit('opponentSeriesConfirmed', { opponentName: player.name });
            }

            if (gameService.areAllPlayersReady(gameId) && game.currentPhase === 'cardSelection') {
                console.log(`Both players in game ${gameId} have confirmed series. Transitioning to bidding phase.`);
                gameService.transitionToBidding(gameId);

                const nextScreenPath = `/game/${gameId}/bidding`;
                game.players.forEach(p => {
                    io.to(p.id).emit('allReadyNavigateToBidding', {
                        gameId,
                        nextScreen: nextScreenPath,
                        players: game.players,
                        selfId: p.id
                    });
                });
            }
        });
    };

    const clientReadyForBidding = (socket: Socket) => {
        socket.on('clientReadyForBidding', ({ gameId }: { gameId: string }) => {
            const game = validateGame(gameService.getGame(gameId), gameId);

            if (!game) {
                console.error(`clientReadyForBidding: Game ${gameId} not found.`);
                return;
            }

            biddingService.markPlayerReadyForBidding(game, socket.id);
        });
    };

    const disconnect = (socket: Socket) => {
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const games = gameService.getAllGames();

            for (const gameId in games) {
                const game = games[gameId];
                const playerIndex = game.players.findIndex(p => p.id === socket.id);

                if (playerIndex !== -1) {
                    const playerName = game.players[playerIndex].name;
                    const wasPlayerDueToBid = !game.bidsSubmittedThisRound.has(socket.id);

                    const result = gameService.removePlayer(gameId, socket.id);

                    if (!result.shouldDeleteGame && result.remainingPlayer) {
                        io.to(result.remainingPlayer.id).emit('playerLeft', {
                            gameId,
                            disconnectedPlayerId: socket.id,
                            disconnectedPlayerName: playerName
                        });

                        handleBiddingDisconnection(game, playerName, wasPlayerDueToBid, result.remainingPlayer, io, biddingService);
                    }
                    break;
                }
            }
        });
    };

    return {
        createGame,
        joinGame,
        playerSelectedSeries,
        clientReadyForBidding,
        disconnect
    };
};

const handleGameNavigation = (game: any, io: SocketIOServer) => {
    if (game.currentPhase === 'cardSelection' &&
        (!game.playerSelectedSeries[game.players[0].id] || !game.playerSelectedSeries[game.players[1].id])) {

        game.players.forEach((player: any) => {
            io.to(player.id).emit('navigateToGameSetup', {
                gameId: game.id,
                players: game.players,
                selfId: player.id
            });
        });

    } else if (game.currentPhase === 'bidding' ||
        (game.playerSelectedSeries[game.players[0].id] && game.playerSelectedSeries[game.players[1].id])) {

        game.currentPhase = 'bidding';

        game.players.forEach((player: any) => {
            game.playersReadyForBidding.add(player.id);
            io.to(player.id).emit('allReadyNavigateToBidding', {
                gameId: game.id,
                nextScreen: `/game/${game.id}/bidding`,
                players: game.players,
                selfId: player.id
            });
        });
    }
};

const handleBiddingDisconnection = (
    game: any,
    playerName: string,
    wasPlayerDueToBid: boolean,
    remainingPlayer: any,
    io: SocketIOServer,
    biddingService: any
) => {
    if (game.bidsSubmittedThisRound.size < 2 && game.players.length === 1) {
        console.log(`Opponent ${playerName} left mid-bid in ${game.id}. Notifying ${remainingPlayer.name}. Bidding cancelled for this round.`);
        io.to(remainingPlayer.id).emit('biddingCancelledOpponentLeft', {
            message: `${playerName} left. Bidding round cancelled. New round will start.`
        });
        setTimeout(() => biddingService.startBiddingPhase(game), 3000);
    }
}; 