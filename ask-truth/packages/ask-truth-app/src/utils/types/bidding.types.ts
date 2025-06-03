export interface BiddingLocationState {
    players?: { id: string; name: string }[];
    selfId?: string;
}

export interface BidOutcome {
    winnerName?: string;
    bidsTied?: boolean;
}

export interface BiddingPhaseData {
    gameId: string;
    myPlayerId: string;
    myPlayerName: string;
    myInitialCoins: number;
    opponentName: string;
    opponentLowCoins: boolean;
    timerDuration: number;
    askedQuestionsHistory?: import('../questions').ClientAskedQuestionInfo[];
}

export interface BiddingResolvedData {
    winnerId?: string;
    winnerName?: string;
    bidsTied: boolean;
    yourNewCoinTotal: number;
    opponentNewLowCoinsStatus: boolean;
}

export interface NavigateToTruthGuessPayload {
    gameId: string;
    guesserId: string;
    guesserName: string;
    targetId: string;
    targetName: string;
}

export interface OpponentIsGuessingPayload {
    gameId: string;
    guesserId: string;
    guesserName: string;
}

export interface BiddingState {
    myPlayerName: string;
    opponentPlayerName: string;
    myPlayerId: string;
    myCoins: number;
    opponentHasFewCoins: boolean;
    currentBidAmount: number;
    timeLeft: number;
    isTimerActive: boolean;
    hasBidBeenSubmitted: boolean;
    biddingStatusMessage: string;
    bidOutcome: BidOutcome | null;
    canChooseAction: boolean;
    isOpponentChoosingQuestion: boolean;
    askedQuestions: import('../questions').ClientAskedQuestionInfo[];
} 