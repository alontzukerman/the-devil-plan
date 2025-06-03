import React from 'react';
import { Button } from '@ask-truth/ui';

interface BidControlsProps {
    currentBidAmount: number;
    myCoins: number;
    isTimerActive: boolean;
    hasBidBeenSubmitted: boolean;
    onIncreaseBid: () => void;
    onDecreaseBid: () => void;
}

export const BidControls: React.FC<BidControlsProps> = ({
    currentBidAmount,
    myCoins,
    isTimerActive,
    hasBidBeenSubmitted,
    onIncreaseBid,
    onDecreaseBid
}) => {
    if (hasBidBeenSubmitted || !isTimerActive) {
        return null;
    }

    return (
        <div className="flex items-center justify-center space-x-4 mb-4">
            <Button
                onClick={onDecreaseBid}
                disabled={currentBidAmount === 0 || !isTimerActive || hasBidBeenSubmitted}
                variant="danger"
                size="lg"
                className="disabled:opacity-50"
            >
                -
            </Button>
            <span className="text-3xl font-bold text-amber-400 w-16 text-center">
                {currentBidAmount}
            </span>
            <Button
                onClick={onIncreaseBid}
                disabled={currentBidAmount >= myCoins || !isTimerActive || hasBidBeenSubmitted}
                variant="primary"
                size="lg"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
                +
            </Button>
        </div>
    );
}; 