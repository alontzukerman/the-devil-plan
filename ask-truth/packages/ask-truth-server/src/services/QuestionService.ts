import { Server as SocketIOServer } from 'socket.io';
import { Game, AskedQuestionInfo } from '../types';
import { SERVER_PREDEFINED_QUESTIONS } from '../data/questions';
import { GAME_CONSTANTS } from '../constants/game.constants';

export class QuestionService {
    constructor(private io: SocketIOServer, private biddingService: any) { }

    processQuestionSelection(game: Game, questionId: string, params: any, askingPlayerId: string): boolean {
        if (game.currentBidWinnerId !== askingPlayerId || game.currentPhase !== 'askQuestion') {
            console.error(`Invalid question selection for game ${game.id} from ${askingPlayerId}. Current phase: ${game.currentPhase}, Bid winner: ${game.currentBidWinnerId}`);
            return false;
        }

        const askingPlayer = game.players.find(p => p.id === askingPlayerId);
        const answeringPlayer = game.players.find(p => p.id !== askingPlayerId);

        if (!askingPlayer || !answeringPlayer) {
            console.error(`Players not found for question selection in game ${game.id}`);
            return false;
        }

        const question = SERVER_PREDEFINED_QUESTIONS.find(q => q.id === questionId);
        if (!question) {
            console.error(`Selected question ID ${questionId} not found on server for game ${game.id}.`);
            return false;
        }

        // Validate input parameters if the question requires them
        if (!this.validateQuestionParams(question, params)) {
            console.error(`Invalid params for question ${questionId}. Game: ${game.id}`);
            return false;
        }

        // Server calculates the answer
        const answer = question.calculateAnswer(game.playerSelectedSeries[answeringPlayer.id], params);

        const askedQuestionEntry: AskedQuestionInfo = {
            questionId: question.id,
            questionText: question.text,
            answer,
            params,
            answeredByPlayerId: answeringPlayer.id,
            askedByPlayerId: askingPlayer.id,
        };

        game.askedQuestions.push(askedQuestionEntry);

        console.log(`Game ${game.id}: ${askingPlayer.name} asked "${question.text}" (params: ${JSON.stringify(params)}). Answer for ${answeringPlayer.name}: ${JSON.stringify(answer)}`);

        // Broadcast the question and answer to both players in the game room
        this.io.to(game.id).emit('questionAnswered', {
            ...askedQuestionEntry,
            gameId: game.id,
        });

        console.log(`Game ${game.id}: Question answered. Displaying for a few seconds before starting new bidding phase.`);

        // Delay before starting the next bidding phase
        setTimeout(() => {
            console.log(`Game ${game.id}: Delay ended. Starting new bidding phase.`);
            this.biddingService.startBiddingPhase(game);
        }, GAME_CONSTANTS.QUESTION_DISPLAY_DELAY);

        return true;
    }

    private validateQuestionParams(question: any, params: any): boolean {
        if (question.requiresInput && question.requiresInput !== 'NONE') {
            if (!params) {
                return false;
            }

            if (question.requiresInput === 'CARD_POSITIONS' &&
                (!params.positions || params.positions.length !== question.numberOfInputs)) {
                return false;
            }
        }

        return true;
    }

    handlePlayerChoice(game: Game, choice: 'Truth' | 'Ask', playerId: string): boolean {
        if (game.currentBidWinnerId !== playerId) {
            console.error(`Invalid player choice for game ${game.id} from socket ${playerId}. Current bid winner: ${game.currentBidWinnerId}`);
            return false;
        }

        console.log(`Player ${playerId} in game ${game.id} chose: ${choice}`);
        const opponent = game.players.find(p => p.id !== playerId);
        if (!opponent) {
            console.error(`Opponent not found for player ${playerId} in game ${game.id}`);
            return false;
        }

        if (choice === 'Truth') {
            game.currentPhase = 'truthGuessing';
            const guesserPlayer = game.players.find(p => p.id === playerId);
            const targetPlayer = opponent;

            console.log(`Game ${game.id} phase changed to truthGuessing. ${guesserPlayer?.name} (${guesserPlayer?.id}) will guess ${targetPlayer?.name} (${targetPlayer?.id}).`);

            if (guesserPlayer && targetPlayer) {
                this.io.to(guesserPlayer.id).emit('navigateToTruthGuess', {
                    gameId: game.id,
                    guesserId: guesserPlayer.id,
                    guesserName: guesserPlayer.name,
                    targetId: targetPlayer.id,
                    targetName: targetPlayer.name
                });

                this.io.to(targetPlayer.id).emit('opponentIsGuessing', {
                    gameId: game.id,
                    guesserId: guesserPlayer.id,
                    guesserName: guesserPlayer.name
                });
            }
        } else if (choice === 'Ask') {
            game.currentPhase = 'askQuestion';
            console.log(`Game ${game.id} phase changed to askQuestion. ${playerId} will select a question.`);

            const winnerPlayer = game.players.find(p => p.id === playerId);

            this.io.to(playerId).emit('navigateToQuestionSelection', {
                gameId: game.id,
                chooserName: winnerPlayer?.name
            });

            console.log(`Server: Emitting 'opponentChoosingQuestion' to opponent ${opponent.id}. GameId: "${game.id}", Chooser: "${winnerPlayer?.name}"`);
            this.io.to(opponent.id).emit('opponentChoosingQuestion', {
                gameId: game.id,
                chooserName: winnerPlayer?.name
            });
        }

        return true;
    }
} 