import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface UseBiddingTimerProps {
    socket: Socket | null;
    gameId: string | undefined;
    timeLeft: number;
    isTimerActive: boolean;
    hasBidBeenSubmitted: boolean;
    currentBidAmount: number;
    setTimeLeft: (value: number | ((prev: number) => number)) => void;
    setIsTimerActive: (value: boolean) => void;
    setHasBidBeenSubmitted: (value: boolean) => void;
    setBiddingStatusMessage: (message: string) => void;
}

export const useBiddingTimer = ({
    socket,
    gameId,
    timeLeft,
    isTimerActive,
    hasBidBeenSubmitted,
    currentBidAmount,
    setTimeLeft,
    setIsTimerActive,
    setHasBidBeenSubmitted,
    setBiddingStatusMessage
}: UseBiddingTimerProps) => {
    // Timer countdown effect
    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            const timerId = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timerId);
        } else if (isTimerActive && timeLeft === 0) {
            setIsTimerActive(false);
            if (!hasBidBeenSubmitted) {
                setBiddingStatusMessage(`Time up! Submitting your bid of ${currentBidAmount} coins.`);
                console.log('Timer ended, submitting bid:', currentBidAmount);
                socket?.emit('submitFinalBid', { gameId, bidAmount: currentBidAmount });
                setHasBidBeenSubmitted(true);
            }
        }
    }, [
        isTimerActive,
        timeLeft,
        socket,
        gameId,
        currentBidAmount,
        hasBidBeenSubmitted,
        setTimeLeft,
        setIsTimerActive,
        setHasBidBeenSubmitted,
        setBiddingStatusMessage
    ]);
}; 