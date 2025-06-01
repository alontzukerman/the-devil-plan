import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = ['http://localhost:5173']; // Adjust if your React app runs on a different port
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin!) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new SocketIOServer(server, {
    cors: corsOptions
});

const STARTING_COINS = 10;
const BIDDING_TIMER_DURATION = 10; // seconds
const COINS_AWARDED_PER_ROUND = 2;
const LOW_COIN_THRESHOLD = 5;

// Mirrored types from client for server-side question definitions
export type ServerQuestionCategory = 'SUM' | 'COUNT' | 'POSITION' | 'GENERAL';
export type ServerQuestionInputType = 'NONE' | 'CARD_POSITIONS' | 'CARD_SHAPE' | 'CARD_VALUE' | 'SPECIFIC_CARD';
export type ServerAnswerValueType = 'BOOLEAN' | 'NUMBER' | 'STRING_ARRAY' | 'POSITION_ARRAY' | 'STRING';

interface ServerQuestion {
    id: string;
    text: string;
    category: ServerQuestionCategory;
    answerType: ServerAnswerValueType;
    requiresInput?: ServerQuestionInputType;
    numberOfInputs?: number;
    // Actual server-side calculation logic, now with params
    calculateAnswer: (series: ServerCard[], params?: any) => any; // Return type is now any
}

const SERVER_PREDEFINED_QUESTIONS: ServerQuestion[] = [
    {
        id: "SUM_THREE_SELECTED_POSITIONS",
        text: "Select 3 card positions. What is the total value of the cards at these positions?",
        category: "SUM",
        answerType: "NUMBER",
        requiresInput: "CARD_POSITIONS",
        numberOfInputs: 3,
        calculateAnswer: (series, params) => {
            // Placeholder logic: Actual logic will sum values at specified positions
            // Params would be e.g. { positions: [0, 2, 4] }
            console.log('[Server] Calculating answer for SUM_THREE_SELECTED_POSITIONS with params:', params, 'and series:', series);
            // For now, return a placeholder or handle if params/series are not as expected.
            if (!params || !params.positions || params.positions.length !== 3) return 0; // Or throw error
            // This is just a placeholder until real logic is implemented
            return 99; // Placeholder answer
        }
    },
    {
        id: "SAMPLE_HIGHEST_CARD_FACE",
        text: "Is the highest card in your series a face card (King, Queen, or Jack)?",
        category: "GENERAL",
        answerType: "BOOLEAN",
        requiresInput: "NONE",
        calculateAnswer: (series) => { // No params for this one
            console.log('[Server] Calculating answer for SAMPLE_HIGHEST_CARD_FACE for series:', series);
            // Placeholder for actual logic (e.g., find max rank, check if > 10)
            return true;
        }
    },
];

// Card type - mirrors client-side but used for server-side logic
// The client will send CardType[] where CardType has id, suit, rank.
interface ServerCard {
    id: string; // Client-generated unique ID for the card instance
    suit: string; // 'H', 'D', 'C', 'S'
    rank: number; // 1-13 (A-K)
}

interface Player {
    id: string; // socket.id
    name: string;
    // We can add more player-specific game data here later
}

interface AskedQuestionInfo {
    questionId: string;
    questionText: string;
    answer: any; // Changed from boolean to any to support various answer types
    params?: any; // To store input parameters like selected positions, shape, etc.
    answeredByPlayerId: string; // The ID of the player whose series was interrogated
    askedByPlayerId: string; // The ID of the player who asked the question (bid winner)
}

interface Game {
    id: string;
    players: Player[];
    playerSelectedSeries: Record<string, ServerCard[]>; // PlayerID -> selected 8-card series
    playerCoins: Record<string, number>;          // PlayerID -> coin count
    currentBids: Record<string, number>;           // PlayerID -> submitted bid for the current round
    bidsSubmittedThisRound: Set<string>;         // Set of PlayerIDs who have submitted bids this round
    playersReadyForBidding: Set<string>;
    currentBidWinnerId?: string; // Stores who won the last bid
    currentPhase: 'cardSelection' | 'bidding' | 'truthGuessing' | 'askQuestion' | 'gameOver';
    askedQuestions: AskedQuestionInfo[]; // To store history of asked questions and answers
}

const games: Record<string, Game> = {};

const generateGameId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Ask or Truth Server is running!');
});

// Helper function to start a bidding phase
const startBiddingPhase = (gameId: string) => {
    const game = games[gameId];
    if (!game || game.players.length !== 2) {
        console.error(`Cannot start bidding phase for game ${gameId}: invalid game state.`);
        return;
    }

    console.log(`[startBiddingPhase] Clearing playersReadyForBidding for game ${gameId} before starting new bid round.`);
    game.playersReadyForBidding.clear(); // Clear readiness for the new bidding phase being started now.

    game.currentPhase = 'bidding';
    console.log(`Starting bidding phase for game ${gameId}. Total asked questions in game: ${game.askedQuestions.length}`);
    game.currentBids = {};
    game.bidsSubmittedThisRound = new Set();

    game.players.forEach(player => {
        const opponent = game.players.find(p => p.id !== player.id);
        if (!opponent) return;

        // Filter asked questions to only include those asked by the current player
        const playerSpecificAskedQuestions = game.askedQuestions.filter(
            q => q.askedByPlayerId === player.id
        );

        io.to(player.id).emit('biddingPhaseState', {
            gameId: game.id,
            myPlayerId: player.id,
            myPlayerName: player.name,
            myInitialCoins: game.playerCoins[player.id],
            opponentName: opponent.name,
            opponentLowCoins: game.playerCoins[opponent.id] <= LOW_COIN_THRESHOLD,
            timerDuration: BIDDING_TIMER_DURATION,
            askedQuestionsHistory: playerSpecificAskedQuestions, // Send player-specific history
        });
    });
};

// Helper function to resolve bids
const resolveBids = (gameId: string) => {
    const game = games[gameId];
    if (!game || game.players.length !== 2 || game.bidsSubmittedThisRound.size !== 2) {
        console.error(`Cannot resolve bids for game ${gameId}: not all bids submitted or invalid player count. Submitted: ${game?.bidsSubmittedThisRound.size}`);
        // This can happen if a player disconnects after submitting bid, and before other player submits.
        // Or if one client fails to send submitFinalBid.
        // Consider a server-side timeout for the round as a whole.
        return;
    }
    console.log(`Resolving bids for game ${gameId}. Bids:`, game.currentBids);

    const [player1, player2] = game.players;
    const bid1 = game.currentBids[player1.id] ?? 0; // Default to 0 if somehow undefined
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
    game.currentBidWinnerId = winnerId; // Store the winner

    // Update coin totals: Subtract bids, then add awarded coins
    game.playerCoins[player1.id] = (game.playerCoins[player1.id] - bid1) + COINS_AWARDED_PER_ROUND;
    game.playerCoins[player2.id] = (game.playerCoins[player2.id] - bid2) + COINS_AWARDED_PER_ROUND;

    console.log(`Bids resolved for ${gameId}. Winner: ${winnerName || (bidsTied ? 'Tied' : 'None')}. New coins: P1=${game.playerCoins[player1.id]}, P2=${game.playerCoins[player2.id]}`);


    // Emit results to each player
    game.players.forEach(player => {
        const opponent = game.players.find(p => p.id !== player.id);
        if (!opponent) return;

        io.to(player.id).emit('biddingResolved', {
            winnerId,
            winnerName,
            bidsTied,
            yourNewCoinTotal: game.playerCoins[player.id],
            opponentNewLowCoinsStatus: game.playerCoins[opponent.id] <= LOW_COIN_THRESHOLD,
        });
    });

    if (bidsTied) {
        console.log(`Bids tied in game ${gameId}. Starting new bidding round shortly.`);
        setTimeout(() => startBiddingPhase(gameId), 3000); // Restart bidding if tied
    } else {
        // If there is a winner, game waits for winner to choose Ask/Truth via 'playerMadeChoice'
        console.log(`Game ${gameId} waiting for ${winnerName} (${winnerId}) to choose Ask or Truth.`);
        // Optionally, you can emit an event to the winner to enable their UI for choosing
        if (winnerId) {
            io.to(winnerId).emit('enableActionChoice', { gameId });
        }
    }
};

io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createGame', ({ playerName }: { playerName: string }) => {
        const gameId = generateGameId();
        const newPlayer: Player = { id: socket.id, name: playerName };
        games[gameId] = {
            id: gameId,
            players: [newPlayer],
            playerSelectedSeries: {}, // Initialize as empty object
            playerCoins: {},
            currentBids: {},
            bidsSubmittedThisRound: new Set(),
            playersReadyForBidding: new Set(),
            currentPhase: 'cardSelection', // Initial phase
            askedQuestions: [], // Initialize asked questions array
            // currentBidWinnerId will be set when a bid is won
        };
        socket.join(gameId);
        console.log(`Player ${playerName} (${socket.id}) created game ${gameId}`);
        socket.emit('gameCreated', { gameId, playerId: socket.id, players: games[gameId].players });
        socket.emit('updatePlayerNames', { currentPlayerName: newPlayer.name, opponentPlayerName: 'Waiting for opponent...' });
    });

    socket.on('joinGame', ({ gameId, playerName }: { gameId: string, playerName: string }) => {
        const game = games[gameId];
        if (game) {
            if (game.players.length < 2 && !game.players.find(p => p.id === socket.id)) {
                const newPlayer: Player = { id: socket.id, name: playerName };
                game.players.push(newPlayer);
                socket.join(gameId);
                console.log(`Player ${playerName} (${socket.id}) joined game ${gameId}`);
                io.to(gameId).emit('playerJoined', { gameId, players: game.players });

                if (game.players.length === 2) {
                    const player1 = game.players[0];
                    const player2 = game.players[1];
                    game.playerCoins[player1.id] = STARTING_COINS;
                    game.playerCoins[player2.id] = STARTING_COINS;
                    console.log(`Initialized coins for game ${gameId}: ${player1.name}=${STARTING_COINS}, ${player2.name}=${STARTING_COINS}`);

                    io.to(player1.id).emit('updatePlayerNames', { currentPlayerName: player1.name, opponentPlayerName: player2.name });
                    io.to(player2.id).emit('updatePlayerNames', { currentPlayerName: player2.name, opponentPlayerName: player1.name });
                    io.to(gameId).emit('navigateToGameSetup', { gameId, players: game.players, selfId: socket.id /* Ensure selfId is available */ });
                }
            } else if (game.players.find(p => p.id === socket.id)) {
                socket.join(gameId);
                socket.emit('playerJoined', { gameId, players: game.players });
                if (game.players.length === 2) {
                    const joiningPlayer = game.players.find(p => p.id === socket.id)!;
                    const otherPlayer = game.players.find(p => p.id !== socket.id)!;
                    // Send current player names
                    io.to(joiningPlayer.id).emit('updatePlayerNames', { currentPlayerName: joiningPlayer.name, opponentPlayerName: otherPlayer.name });
                    io.to(otherPlayer.id).emit('updatePlayerNames', { currentPlayerName: otherPlayer.name, opponentPlayerName: joiningPlayer.name });

                    // Determine current game phase and navigate accordingly
                    if (game.currentPhase === 'cardSelection' && (!game.playerSelectedSeries[joiningPlayer.id] || !game.playerSelectedSeries[otherPlayer.id])) {
                        // If in card selection and either player hasn't selected cards yet
                        io.to(socket.id).emit('navigateToGameSetup', { gameId, players: game.players, selfId: socket.id });
                    } else if (game.currentPhase === 'bidding' || (game.playerSelectedSeries[joiningPlayer.id] && game.playerSelectedSeries[otherPlayer.id])) {
                        // If series are selected by both, or game is already in bidding phase, go to bidding
                        // (This also handles a player rejoining when it's their turn to select cards but the other has)
                        game.currentPhase = 'bidding'; // Ensure phase is set if rejoining here
                        game.playersReadyForBidding.add(socket.id); // Mark rejoining player as ready for bidding if they weren't before

                        io.to(socket.id).emit('allReadyNavigateToBidding', { gameId, nextScreen: `/game/${gameId}/bidding`, players: game.players, selfId: socket.id });

                        // Attempt to resend biddingPhaseState if applicable
                        // Check if both players are now ready for bidding if the other player was already waiting
                        if (game.playersReadyForBidding.size === 2) {
                            console.log(`Both players now ready for bidding in ${gameId} after rejoin. Starting bidding phase.`);
                            startBiddingPhase(gameId);
                        } else if (game.players.length === 2) {
                            // If only this player is ready, wait for other or send individual state if already started
                            console.log(`Player ${joiningPlayer.name} reconnected to game ${gameId} during bidding phase. Waiting for opponent or resending state.`);
                            // Resend bidding state to the rejoining player if the phase has already started for the opponent
                            // This needs to be handled carefully: what if the timer is already running for the other player?
                            // For simplicity, if one player is already in bidding, we will restart the bidding for both.
                            // This could be refined to only send state if bidding is active and not restart.
                            const opponent = game.players.find(p => p.id !== socket.id);
                            if (opponent && game.bidsSubmittedThisRound.size < 2 && game.currentBids[opponent.id] === undefined) { // Check if opponent hasn't bid yet
                                console.log(`Re-broadcasting biddingPhaseState for ${gameId} as a player reconnected.`);
                                startBiddingPhase(gameId); // This will reset bids and resend to both
                            } else {
                                // If opponent already bid, or something is off, just ensure they are on bidding screen
                                // The clientReadyForBidding from both will trigger the next step.
                                io.to(socket.id).emit('biddingPhaseState', { // Send a minimal state to get them on the page
                                    gameId: game.id,
                                    myPlayerId: socket.id,
                                    myPlayerName: joiningPlayer.name,
                                    myInitialCoins: game.playerCoins[socket.id],
                                    opponentName: otherPlayer.name,
                                    opponentLowCoins: game.playerCoins[otherPlayer.id] <= LOW_COIN_THRESHOLD,
                                    timerDuration: BIDDING_TIMER_DURATION,
                                });
                            }
                        }
                    } else {
                        // Fallback or other phases - for now, just log
                        console.log(`Player rejoining, game in phase: ${game.currentPhase}. Game state:`, game);
                        // Potentially navigate to a generic waiting screen or the correct screen based on currentPhase
                        socket.emit('gameError', { message: `Rejoin to phase ${game.currentPhase} not fully handled yet.` });
                    }
                } else {
                    // Only one player in game, just emit playerJoined, they will go to waiting state on StartScreen or similar
                    io.to(gameId).emit('playerJoined', { gameId, players: game.players });
                }
            } else {
                socket.emit('gameJoinError', { message: 'Game is full.' });
            }
        } else {
            socket.emit('gameJoinError', { message: 'Game ID not found.' });
        }
    });

    socket.on('playerSelectedSeries', ({ gameId, series }: { gameId: string, series: ServerCard[] }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player) {
            socket.emit('gameError', { message: 'Error selecting series: Invalid game or player.' });
            return;
        }
        game.playerSelectedSeries[socket.id] = series; // Use playerSelectedSeries
        console.log(`Player ${player.name} (${socket.id}) in game ${gameId} confirmed series.`);

        const opponent = game.players.find(p => p.id !== socket.id);
        if (opponent) {
            io.to(opponent.id).emit('opponentSeriesConfirmed', { opponentName: player.name });
        }

        // Check if both players have now selected their series and if we are in the card selection phase
        if (game.players.length === 2 &&
            game.playerSelectedSeries[game.players[0].id] &&
            game.playerSelectedSeries[game.players[1].id] &&
            game.currentPhase === 'cardSelection') { // Corrected phase check

            console.log(`Both players in game ${gameId} have confirmed series. Transitioning to bidding phase.`);
            game.currentPhase = 'bidding'; // Update game phase

            const nextScreenPath = `/game/${gameId}/bidding`;
            game.playersReadyForBidding.clear(); // Clear readiness for the new bidding phase
            game.players.forEach(p => {
                io.to(p.id).emit('allReadyNavigateToBidding', {
                    gameId,
                    nextScreen: nextScreenPath,
                    players: game.players,
                    selfId: p.id
                });
            });
            // Server will now wait for 'clientReadyForBidding' from both clients before starting the bid timer
        }
    });

    socket.on('clientReadyForBidding', ({ gameId }: { gameId: string }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player) {
            console.error(`clientReadyForBidding: Game ${gameId} or player ${socket.id} not found.`);
            return;
        }

        console.log(`Player ${player.name} (${socket.id}) is ready for bidding in game ${gameId}.`);
        game.playersReadyForBidding.add(socket.id);

        if (game.players.length === 2 && game.playersReadyForBidding.size === 2) {
            console.log(`Both players in game ${gameId} are ready for bidding. Starting phase.`);
            startBiddingPhase(gameId);
            game.playersReadyForBidding.clear(); // Clear for next potential bidding phase start
        }
    });

    socket.on('submitFinalBid', ({ gameId, bidAmount }: { gameId: string, bidAmount: number }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);

        if (!game || !player) {
            socket.emit('gameError', { message: 'Error submitting bid: Invalid game or player.' });
            return;
        }
        if (game.bidsSubmittedThisRound.has(socket.id)) {
            console.warn(`Player ${player.name} (${socket.id}) tried to submit bid multiple times for game ${gameId}. Ignoring.`);
            return;
        }
        // Validate bid amount server-side
        const actualBidAmount = Math.max(0, Math.min(bidAmount, game.playerCoins[socket.id]));
        if (actualBidAmount !== bidAmount) {
            console.warn(`Player ${player.name} (${socket.id}) submitted invalid bid ${bidAmount}, adjusted to ${actualBidAmount}. Coins: ${game.playerCoins[socket.id]}`);
        }

        game.currentBids[socket.id] = actualBidAmount;
        game.bidsSubmittedThisRound.add(socket.id);
        console.log(`Player ${player.name} (${socket.id}) submitted final bid of ${actualBidAmount} for game ${gameId}.`);

        const opponent = game.players.find(p => p.id !== socket.id);
        if (opponent && !game.bidsSubmittedThisRound.has(opponent.id)) {
            io.to(opponent.id).emit('opponentHasBidNotification'); // Optional: tell opponent other player has bid.
        }

        if (game.bidsSubmittedThisRound.size === 2) {
            resolveBids(gameId);
        }
    });

    socket.on('playerMadeChoice', ({ gameId, choice }: { gameId: string, choice: 'Truth' | 'Ask' }) => {
        const game = games[gameId];
        if (!game || game.currentBidWinnerId !== socket.id) {
            console.error(`Invalid 'playerMadeChoice' received for game ${gameId} from socket ${socket.id}. Game exists: ${!!game}, Is bid winner: ${game?.currentBidWinnerId === socket.id}`);
            // Optionally emit an error back to the client
            socket.emit('errorToClient', { message: "It's not your turn to make a choice or game not found." });
            return;
        }

        console.log(`Player ${socket.id} in game ${gameId} chose: ${choice}`);
        const opponent = game.players.find(p => p.id !== socket.id);
        if (!opponent) {
            console.error(`Opponent not found for player ${socket.id} in game ${gameId}`);
            // This ideally shouldn't happen if the game requires two players to be in this state.
            return;
        }

        if (choice === 'Truth') {
            game.currentPhase = 'truthGuessing';
            const guesserPlayer = game.players.find(p => p.id === socket.id);
            // Opponent is the target of the guess
            const targetPlayer = opponent; // opponent is already defined and is the target

            console.log(`Game ${gameId} phase changed to truthGuessing. ${guesserPlayer?.name} (${guesserPlayer?.id}) will guess ${targetPlayer?.name} (${targetPlayer?.id}).`);

            // Notify winner (guesser) to navigate to TruthGuessingScreen
            if (guesserPlayer && targetPlayer) {
                io.to(guesserPlayer.id).emit('navigateToTruthGuess', {
                    gameId,
                    guesserId: guesserPlayer.id,
                    guesserName: guesserPlayer.name,
                    targetId: targetPlayer.id,
                    targetName: targetPlayer.name
                });

                // Notify opponent (target) that the winner is guessing their truth
                io.to(targetPlayer.id).emit('opponentIsGuessing', {
                    gameId,
                    guesserId: guesserPlayer.id,
                    guesserName: guesserPlayer.name
                });
            } else {
                console.error(`Error in 'Truth' choice: Guesser or target player not found. Guesser: ${guesserPlayer}, Target: ${targetPlayer}`);
            }
        } else if (choice === 'Ask') {
            game.currentPhase = 'askQuestion';
            console.log(`Game ${gameId} phase changed to askQuestion. ${socket.id} will select a question.`);

            const winnerPlayer = game.players.find(p => p.id === socket.id);

            // Notify winner to navigate to QuestionSelectionScreen
            io.to(socket.id).emit('navigateToQuestionSelection', {
                gameId,
                chooserName: winnerPlayer?.name
            });

            // Notify opponent that the winner is choosing a question
            console.log(`Server: Emitting 'opponentChoosingQuestion' to opponent ${opponent.id}. GameId to be sent: "${gameId}" (type: ${typeof gameId}), Chooser: "${winnerPlayer?.name}"`);
            io.to(opponent.id).emit('opponentChoosingQuestion', {
                gameId,
                chooserName: winnerPlayer?.name
            });
        } else {
            console.warn(`Unknown choice received in game ${gameId}: ${choice}`);
            // Handle unknown choice, maybe resend options or log error
        }
    });

    // Handler for when a player (bid winner) selects a specific question
    socket.on('playerSelectedQuestion', ({ gameId, questionId, params }: { gameId: string, questionId: string, params?: any }) => {
        const game = games[gameId];
        if (!game || game.currentBidWinnerId !== socket.id || game.currentPhase !== 'askQuestion') {
            console.error(`Invalid 'playerSelectedQuestion' for game ${gameId} from ${socket.id}. Conditions not met. Current phase: ${game?.currentPhase}, Bid winner: ${game?.currentBidWinnerId}`);
            socket.emit('errorToClient', { message: "Cannot select question now or invalid game state." });
            return;
        }

        const askingPlayer = game.players.find(p => p.id === socket.id);
        const answeringPlayer = game.players.find(p => p.id !== socket.id);

        if (!askingPlayer || !answeringPlayer) {
            console.error(`Players not found for question selection in game ${gameId}`);
            return;
        }

        const question = SERVER_PREDEFINED_QUESTIONS.find(q => q.id === questionId);
        if (!question) {
            console.error(`Selected question ID ${questionId} not found on server for game ${gameId}.`);
            socket.emit('errorToClient', { message: `Question ${questionId} not found.` });
            return;
        }

        // Validate input parameters if the question requires them
        if (question.requiresInput && question.requiresInput !== 'NONE') {
            if (!params) {
                console.error(`Question ${questionId} requires params, but none were provided. Game: ${gameId}`);
                socket.emit('errorToClient', { message: `Input parameters are missing for this question.` });
                return;
            }
            // Add more specific param validation here based on question.requiresInput / question.numberOfInputs
            if (question.requiresInput === 'CARD_POSITIONS' && (!params.positions || params.positions.length !== question.numberOfInputs)) {
                console.error(`Invalid params for CARD_POSITIONS. Expected ${question.numberOfInputs} positions. Got:`, params.positions);
                socket.emit('errorToClient', { message: `Invalid input. Please select exactly ${question.numberOfInputs} card positions.` });
                return;
            }
        }

        // Server calculates the answer
        const answer = question.calculateAnswer(game.playerSelectedSeries[answeringPlayer.id], params);

        const askedQuestionEntry: AskedQuestionInfo = {
            questionId: question.id,
            questionText: question.text,
            answer,
            params, // Store the provided params with the question history
            answeredByPlayerId: answeringPlayer.id,
            askedByPlayerId: askingPlayer.id,
        };
        game.askedQuestions.push(askedQuestionEntry);

        console.log(`Game ${gameId}: ${askingPlayer.name} asked "${question.text}" (params: ${JSON.stringify(params)}). Answer for ${answeringPlayer.name}: ${JSON.stringify(answer)}`);

        // Broadcast the question and answer to both players in the game room
        io.to(gameId).emit('questionAnswered', {
            ...askedQuestionEntry,
            gameId,
        });

        console.log(`Game ${gameId}: Question answered. Asker (${socket.id}) will see Q&A on their screen. Opponent sees Q&A on BiddingScreen. Displaying for a few seconds for all.`);

        // Delay before starting the next bidding phase for everyone
        setTimeout(() => {
            console.log(`Game ${gameId}: Delay ended. Starting new bidding phase.`);
            startBiddingPhase(gameId);
        }, 4000); // 4 seconds delay (ensure this is slightly longer than QuestionSelectionScreen's display an dnavigation time)
    });

    socket.on('submitTruthGuess', ({ gameId, guess }: { gameId: string, guess: ServerCard[] }) => {
        const game = games[gameId];
        const guesser = game?.players.find(p => p.id === socket.id);

        if (!game || !guesser || game.currentPhase !== 'truthGuessing' || socket.id !== game.currentBidWinnerId) {
            console.error(`Invalid 'submitTruthGuess' from ${socket.id} for game ${gameId}. Conditions not met.`);
            socket.emit('gameError', { message: 'Cannot submit guess at this time.' });
            return;
        }

        const target = game.players.find(p => p.id !== socket.id);
        if (!target) {
            console.error(`Critical: Target player not found for guess in game ${gameId}`);
            socket.emit('gameError', { message: 'Opponent not found.' });
            return;
        }

        const targetActualSeries = game.playerSelectedSeries[target.id];
        if (!targetActualSeries || targetActualSeries.length !== 8) {
            console.error(`Critical: Target series not found or invalid for game ${gameId}`);
            socket.emit('gameError', { message: 'Opponent\'s series data is missing or invalid.' });
            // This should not happen if card selection was completed correctly.
            // Consider how to handle this - perhaps end game or force a restart of phase.
            return;
        }

        if (!guess || guess.length !== 8) {
            console.warn(`Invalid guess received from ${guesser.name} for game ${gameId}: series length not 8.`);
            socket.emit('truthGuessResult', { gameId, wasGuessCorrect: false, reason: 'Your guess must be 8 cards.' });
            // Do not end phase here, let player try again or server might need a timeout for this phase.
            // For now, we are strict and a bad guess is a failed guess.
            // Let's treat this as an incorrect guess to simplify flow.
            io.to(gameId).emit('truthGuessResult', { gameId, wasGuessCorrect: false });
            console.log(`Guess by ${guesser.name} was incorrect (invalid length). Game ${gameId} continues.`);
            setTimeout(() => startBiddingPhase(gameId), 3000);
            return;
        }

        console.log(`Player ${guesser.name} in game ${gameId} submitted guess for ${target.name}\'s series.`);
        // console.log('Guessed Series:', JSON.stringify(guess));
        // console.log('Actual Series:', JSON.stringify(targetActualSeries));

        let isCorrect = true;
        for (let i = 0; i < 8; i++) {
            if (guess[i].suit !== targetActualSeries[i].suit || guess[i].rank !== targetActualSeries[i].rank) {
                isCorrect = false;
                break;
            }
        }

        if (isCorrect) {
            console.log(`Guess by ${guesser.name} for game ${gameId} was CORRECT! Winner: ${guesser.name}`);
            game.currentPhase = 'gameOver';
            io.to(gameId).emit('truthGuessResult', {
                gameId,
                wasGuessCorrect: true,
                winnerId: guesser.id,
                winnerName: guesser.name
            });
            // Optional: Clean up game resources or mark as ended
            // delete games[gameId]; // Or move to an archive, etc.
        } else {
            console.log(`Guess by ${guesser.name} for game ${gameId} was INCORRECT.`);
            io.to(gameId).emit('truthGuessResult', { gameId, wasGuessCorrect: false });
            // Return to bidding phase
            console.log(`Game ${gameId} continues. Starting new bidding round shortly.`);
            setTimeout(() => startBiddingPhase(gameId), 5000); // Delay and restart bidding
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const gameId in games) {
            const game = games[gameId];
            const playerIndex = game.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const playerName = game.players[playerIndex].name;
                console.log(`Player ${playerName} (${socket.id}) left game ${gameId}`);
                game.players.splice(playerIndex, 1);

                delete game.playerSelectedSeries[socket.id];
                delete game.playerCoins[socket.id];
                delete game.currentBids[socket.id];
                const wasPlayerDueToBid = !game.bidsSubmittedThisRound.has(socket.id);
                game.bidsSubmittedThisRound.delete(socket.id);

                if (game.players.length === 0) {
                    delete games[gameId];
                    console.log(`Game ${gameId} deleted.`);
                } else {
                    const remainingPlayer = game.players[0];
                    io.to(remainingPlayer.id).emit('playerLeft', {
                        gameId,
                        disconnectedPlayerId: socket.id,
                        disconnectedPlayerName: playerName
                    });
                    // If opponent disconnects mid-bidding round (other player hasn't bid or both haven't)
                    if (game.bidsSubmittedThisRound.size < 2 && wasPlayerDueToBid && game.players.length === 1) {
                        console.log(`Opponent ${playerName} left mid-bid in ${gameId}. Notifying ${remainingPlayer.name}. Bidding cancelled for this round.`);
                        io.to(remainingPlayer.id).emit('biddingCancelledOpponentLeft', { message: `${playerName} left. Bidding round cancelled. New round will start.` });
                        // Optionally, reset and restart bidding after a delay
                        setTimeout(() => startBiddingPhase(gameId), 3000);
                    } else if (game.bidsSubmittedThisRound.size === 1 && !wasPlayerDueToBid && game.players.length === 1) {
                        // Disconnecting player already bid, remaining player has not. The round is stuck.
                        console.log(`Player ${playerName} who already bid left game ${gameId}. Remaining player ${remainingPlayer.name} was still due to bid. Cancelling round.`);
                        io.to(remainingPlayer.id).emit('biddingCancelledOpponentLeft', { message: `${playerName} (who already bid) left. Bidding round cancelled. New round will start.` });
                        setTimeout(() => startBiddingPhase(gameId), 3000);
                    }
                }
                break;
            }
        }
    });
});


server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 