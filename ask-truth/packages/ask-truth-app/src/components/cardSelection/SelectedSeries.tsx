import React from 'react';
import CardComponent from '../Card';
import type { CardType as Card } from '@ask-truth/ui';

interface SelectedSeriesProps {
    selectedSeries: Card[];
    onDeselectCard: (card: Card) => void;
}

export const SelectedSeries: React.FC<SelectedSeriesProps> = ({
    selectedSeries,
    onDeselectCard
}) => {
    return (
        <div className="my-4 p-3 bg-neutral-700 bg-opacity-50 shadow-lg rounded-lg w-full max-w-3xl min-h-[8rem] flex items-center justify-center border-2 border-primary-500">
            {selectedSeries.length === 0 ? (
                <p className="text-neutral-400 italic">
                    Your 8-card series will appear here in selection order.
                </p>
            ) : (
                <div className="flex space-x-1 overflow-x-auto p-2">
                    {selectedSeries.map(card => (
                        <CardComponent
                            key={`selected-${card.id}`}
                            card={card}
                            onClick={onDeselectCard}
                            isSelected
                            className="flex-shrink-0 w-16 sm:w-20"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}; 