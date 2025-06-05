import React from 'react';
import { Button, FormField } from '@ask-truth/ui';

interface GameJoiningFormProps {
    playerName: string;
    gameIdToJoin: string;
    isConnected: boolean;
    onGameIdChange: (gameId: string) => void;
    onJoinGame: () => void;
}

export const GameJoiningForm: React.FC<GameJoiningFormProps> = ({
    playerName,
    gameIdToJoin,
    isConnected,
    onGameIdChange,
    onJoinGame
}) => {
    return (
        <>
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-neutral-500"></div>
                <span className="flex-shrink mx-4 text-neutral-400">OR</span>
                <div className="flex-grow border-t border-neutral-500"></div>
            </div>

            <div className="mb-4">
                <FormField
                    label="Enter Game ID to Join:"
                    labelSize="lg"
                    fullWidth
                    className="mb-2"
                    inputProps={{
                        type: "text",
                        value: gameIdToJoin,
                        onChange: (e) => onGameIdChange(e.target.value.toUpperCase()),
                        placeholder: "E.g., XXXXXX",
                        variant: "game",
                        size: "lg"
                    }}
                />
                <Button
                    onClick={onJoinGame}
                    disabled={!playerName.trim() || !gameIdToJoin.trim() || !isConnected}
                    variant="secondary"
                    fullWidth
                >
                    Join Game
                </Button>
            </div>
        </>
    );
}; 