export interface Player {
    id: string;
    name: string;
}

export interface GameState {
    gameId: string;
    players: Player[];
}

export interface StartScreenState {
    playerName: string;
    gameIdToJoin: string;
    createdGameId: string | null;
    isWaitingForOpponent: boolean;
    errorMessage: string | null;
    gamePlayers: Player[];
}

export interface GameCreatedData {
    gameId: string;
    playerId: string;
    players: Player[];
}

export interface PlayerJoinedData {
    gameId: string;
    players: Player[];
}

export interface GameJoinErrorData {
    message: string;
}

export interface PlayerLeftData {
    gameId: string;
    players: Player[];
    disconnectedPlayerId: string;
} 