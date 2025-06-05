import React from 'react';
import { BidControls } from './BidControls';
import { Timer, GameStatus } from '@ask-truth/ui';
import type { BidOutcome } from '../../utils/types/bidding.types';

interface BiddingStatusProps {
    timeLeft: number;
    isTimerActive: boolean;
    isOpponentChoosingQuestion: boolean;
    opponentPlayerName: string;
    bidOutcome: BidOutcome | null;
    canChooseAction: boolean;
    biddingStatusMessage: string;
    currentBidAmount: number;
    myCoins: number;
    hasBidBeenSubmitted: boolean;
    onIncreaseBid: () => void;
    onDecreaseBid: () => void;
}

export const BiddingStatus: React.FC<BiddingStatusProps> = ({
    timeLeft,
    isTimerActive,
    isOpponentChoosingQuestion,
    opponentPlayerName,
    bidOutcome,
    canChooseAction,
    biddingStatusMessage,
    currentBidAmount,
    myCoins,
    hasBidBeenSubmitted,
    onIncreaseBid,
    onDecreaseBid
}) => {
    const getTimerTitle = () => {
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

    const getStatusType = () => {
        if (isOpponentChoosingQuestion) return 'waiting';
        if (bidOutcome && !canChooseAction) return 'success';
        if (canChooseAction) return 'info';
        return 'info';
    };

    return (
        <div className="bg-neutral-600 p-6 rounded-lg mb-6">
            <Timer
                timeLeft={timeLeft}
                isActive={isTimerActive}
                title={getTimerTitle()}
                size="lg"
                showProgress={isTimerActive}
                totalTime={10}
            />

            <BidControls
                currentBidAmount={currentBidAmount}
                myCoins={myCoins}
                isTimerActive={isTimerActive}
                hasBidBeenSubmitted={hasBidBeenSubmitted}
                onIncreaseBid={onIncreaseBid}
                onDecreaseBid={onDecreaseBid}
            />

            <GameStatus
                message={biddingStatusMessage}
                type={getStatusType()}
                showSpinner={isOpponentChoosingQuestion}
                size="md"
            />
        </div>
    );
}; 