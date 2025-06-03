import type { Card } from '../cardUtils';

export interface TruthGuessingLocationState {
    myPlayerId?: string;
    opponentPlayerName?: string;
}

export interface TruthGuessingState {
    targetPlayerName: string;
    guessedSeries: Card[];
    statusMessage: string;
    isGuessConfirmed: boolean;
    isMyTurnToGuess: boolean;
}

export interface TruthGuessResultData {
    gameId: string;
    wasGuessCorrect: boolean;
    winnerId?: string;
    winnerName?: string;
    reason?: string;
}

export interface LoadingState {
    isConnecting: boolean;
    hasGameId: boolean;
    hasTargetPlayer: boolean;
    isMyTurn: boolean;
} 