import React from 'react';
import type { BidOutcome } from '../../utils/types/bidding.types';

interface BiddingTimerProps {
    timeLeft: number;
    isTimerActive: boolean;
    isOpponentChoosingQuestion: boolean;
    opponentPlayerName: string;
    bidOutcome: BidOutcome | null;
    canChooseAction: boolean;
}

export const BiddingTimer: React.FC<BiddingTimerProps> = ({
    timeLeft,
    isTimerActive,
    isOpponentChoosingQuestion,
    opponentPlayerName,
    bidOutcome,
    canChooseAction
}) => {
    const getTitle = () => {
        if (isTimerActive) {
            return `Time Left: ${timeLeft}s`;
        } else if (isOpponentChoosingQuestion) {
            return `${opponentPlayerName || 'Opponent'} is Choosing a Question`;
        } else if (bidOutcome && !canChooseAction) {
            return 'Bid Resolved';
        } else if (canChooseAction) {
            return 'Your Action';
        } else {
            return 'Place Your Bid';
        }
    };

    return (
        <h2 className="text-2xl font-semibold text-center text-info mb-4">
            {getTitle()}
        </h2>
    );
}; 