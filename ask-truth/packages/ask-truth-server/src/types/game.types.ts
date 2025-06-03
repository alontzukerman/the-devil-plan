export type ServerQuestionCategory = 'SUM' | 'COUNT' | 'POSITION' | 'GENERAL';
export type ServerQuestionInputType = 'NONE' | 'CARD_POSITIONS' | 'CARD_SHAPE' | 'CARD_VALUE' | 'SPECIFIC_CARD';
export type ServerAnswerValueType = 'BOOLEAN' | 'NUMBER' | 'STRING_ARRAY' | 'POSITION_ARRAY' | 'STRING';

export interface ServerCard {
    id: string; // Client-generated unique ID for the card instance
    suit: string; // 'H', 'D', 'C', 'S'
    rank: number; // 1-13 (A-K)
}

export interface Player {
    id: string; // socket.id
    name: string;
    // We can add more player-specific game data here later
}

export interface AskedQuestionInfo {
    questionId: string;
    questionText: string;
    answer: any; // Changed from boolean to any to support various answer types
    params?: any; // To store input parameters like selected positions, shape, etc.
    answeredByPlayerId: string; // The ID of the player whose series was interrogated
    askedByPlayerId: string; // The ID of the player who asked the question (bid winner)
}

export type GamePhase = 'cardSelection' | 'bidding' | 'truthGuessing' | 'askQuestion' | 'gameOver';

export interface Game {
    id: string;
    players: Player[];
    playerSelectedSeries: Record<string, ServerCard[]>; // PlayerID -> selected 8-card series
    playerCoins: Record<string, number>;          // PlayerID -> coin count
    currentBids: Record<string, number>;           // PlayerID -> submitted bid for the current round
    bidsSubmittedThisRound: Set<string>;         // Set of PlayerIDs who have submitted bids this round
    playersReadyForBidding: Set<string>;
    currentBidWinnerId?: string; // Stores who won the last bid
    currentPhase: GamePhase;
    askedQuestions: AskedQuestionInfo[]; // To store history of asked questions and answers
} 