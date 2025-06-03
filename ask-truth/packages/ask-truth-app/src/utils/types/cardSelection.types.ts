import type { Card } from '../cardUtils';

export interface Player {
    id: string;
    name: string;
}

export interface CardSelectionLocationState {
    players?: Player[];
    selfId?: string;
}

export interface CardSelectionState {
    selectedSeries: Card[];
    hasConfirmedSelection: boolean;
    opponentHasConfirmed: boolean;
    statusMessage: string;
    currentPlayerName: string;
    opponentPlayerName: string;
}

export interface OpponentConfirmedData {
    opponentName?: string;
}

export interface NavigateToBiddingData {
    nextScreen: string;
}

export interface PlayerDetailsData {
    currentPlayerName: string;
    opponentPlayerName: string;
} 