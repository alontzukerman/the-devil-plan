import React from 'react';

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
            <button
                onClick={onDecreaseBid}
                disabled={currentBidAmount === 0 || !isTimerActive || hasBidBeenSubmitted}
                className="btn bg-red-600 hover:bg-red-700 px-6 py-3 text-xl disabled:opacity-50"
            >
                -
            </button>
            <span className="text-3xl font-bold text-amber-400 w-16 text-center">
                {currentBidAmount}
            </span>
            <button
                onClick={onIncreaseBid}
                disabled={currentBidAmount >= myCoins || !isTimerActive || hasBidBeenSubmitted}
                className="btn bg-green-600 hover:bg-green-700 px-6 py-3 text-xl disabled:opacity-50"
            >
                +
            </button>
        </div>
    );
}; 