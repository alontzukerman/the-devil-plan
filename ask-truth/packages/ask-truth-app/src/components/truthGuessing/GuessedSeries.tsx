import React from 'react';
import CardComponent from '../Card';
import type { Card } from '../../utils/cardUtils';

interface GuessedSeriesProps {
    guessedSeries: Card[];
    isGuessConfirmed: boolean;
    onDeselectCard: (card: Card) => void;
}

export const GuessedSeries: React.FC<GuessedSeriesProps> = ({
    guessedSeries,
    isGuessConfirmed,
    onDeselectCard
}) => {
    return (
        <div className="mb-6 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-2 text-center text-indigo-300">
                Your Current Guess ({guessedSeries.length} / 8 cards):
            </h2>
            <div className="min-h-[8rem] flex items-center justify-center p-2 bg-gray-700 bg-opacity-50 backdrop-blur-sm rounded-lg border-2 border-indigo-500 space-x-1 overflow-x-auto shadow-lg">
                {guessedSeries.length > 0 ? (
                    guessedSeries.map((card) => (
                        <div
                            key={`guessed-${card.id}`}
                            className="transform transition-transform hover:scale-105 flex-shrink-0"
                        >
                            <CardComponent
                                card={card}
                                onClick={() => onDeselectCard(card)}
                                isSelected={false}
                                isDisabled={isGuessConfirmed}
                                className="w-16 sm:w-20"
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 italic">
                        Select 8 cards from the deck below.
                    </p>
                )}
            </div>
        </div>
    );
}; 