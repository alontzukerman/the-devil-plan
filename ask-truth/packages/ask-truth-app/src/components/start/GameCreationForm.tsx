import React from 'react';
import { Button, FormField } from '@ask-truth/ui';

interface GameCreationFormProps {
    playerName: string;
    isConnected: boolean;
    onPlayerNameChange: (name: string) => void;
    onCreateGame: () => void;
}

export const GameCreationForm: React.FC<GameCreationFormProps> = ({
    playerName,
    isConnected,
    onPlayerNameChange,
    onCreateGame
}) => {
    return (
        <>
            <div className="mb-6">
                <FormField
                    label="Enter Your Name:"
                    labelSize="lg"
                    fullWidth
                    inputProps={{
                        type: "text",
                        value: playerName,
                        onChange: (e) => onPlayerNameChange(e.target.value),
                        placeholder: "E.g., Player1",
                        variant: "game",
                        size: "lg"
                    }}
                />
            </div>
            <Button
                onClick={onCreateGame}
                disabled={!playerName.trim() || !isConnected}
                variant="primary"
                fullWidth
                className="mb-4"
            >
                Create New Game
            </Button>
        </>
    );
}; 