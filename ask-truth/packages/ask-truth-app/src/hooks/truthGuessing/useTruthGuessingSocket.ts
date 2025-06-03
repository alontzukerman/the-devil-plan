import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type {
    TruthGuessResultData,
    TruthGuessingState
} from '../../utils/types/truthGuessing.types';

interface UseTruthGuessingSocketProps {
    socket: Socket | null;
    gameId: string | undefined;
    targetPlayerName: string;
    setState: React.Dispatch<React.SetStateAction<TruthGuessingState>>;
}

export const useTruthGuessingSocket = ({
    socket,
    gameId,
    targetPlayerName,
    setState
}: UseTruthGuessingSocketProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket || !gameId) return;

        const handleTruthGuessResult = (data: TruthGuessResultData) => {
            if (data.gameId === gameId) {
                console.log('useTruthGuessingSocket: Truth Guess Result:', data);

                setState(prev => ({
                    ...prev,
                    isGuessConfirmed: true
                }));

                if (data.wasGuessCorrect) {
                    setState(prev => ({
                        ...prev,
                        statusMessage: `Correct! You guessed ${targetPlayerName || 'opponent'}'s series! You win!`
                    }));

                    setTimeout(() => {
                        navigate(`/game/${gameId}/game-over`, {
                            state: { winnerName: data.winnerName }
                        });
                    }, 3000);
                } else {
                    setState(prev => ({
                        ...prev,
                        statusMessage: data.reason || 'Incorrect guess. The game continues...'
                    }));

                    setTimeout(() => {
                        console.log('useTruthGuessingSocket: Incorrect guess, navigating back to bidding screen.');
                        navigate(`/game/${gameId}/bidding`);
                    }, 3000);
                }
            }
        };

        socket.on('truthGuessResult', handleTruthGuessResult);

        return () => {
            socket.off('truthGuessResult', handleTruthGuessResult);
        };
    }, [socket, gameId, navigate, targetPlayerName, setState]);
}; 