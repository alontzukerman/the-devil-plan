import React from 'react';
import { BiddingTimer } from './BiddingTimer';
import { BidControls } from './BidControls';
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
    return (
        <div className="bg-slate-600 p-6 rounded-lg mb-6">
            <BiddingTimer
                timeLeft={timeLeft}
                isTimerActive={isTimerActive}
                isOpponentChoosingQuestion={isOpponentChoosingQuestion}
                opponentPlayerName={opponentPlayerName}
                bidOutcome={bidOutcome}
                canChooseAction={canChooseAction}
            />

            <BidControls
                currentBidAmount={currentBidAmount}
                myCoins={myCoins}
                isTimerActive={isTimerActive}
                hasBidBeenSubmitted={hasBidBeenSubmitted}
                onIncreaseBid={onIncreaseBid}
                onDecreaseBid={onDecreaseBid}
            />

            <p className="text-center text-sky-200 min-h-[2em]">
                {biddingStatusMessage}
            </p>
        </div>
    );
}; 