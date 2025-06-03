export interface GameOverLocationState {
    winnerName?: string;
}

export interface GameOverState {
    winnerName: string;
}

export interface GameOverHeaderProps {
    winnerName: string;
}

export interface GameOverActionsProps {
    onPlayAgain: () => void;
} 