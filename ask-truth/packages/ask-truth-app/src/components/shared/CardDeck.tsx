import React from 'react';
import CardComponent from '../Card';
import { SUITS } from '../../utils/cardUtils';
import type { Card } from '../../utils/cardUtils';

export interface CardDeckProps {
    deck: Card[];
    selectedCards: Card[];
    onSelectCard: (card: Card) => void;
    isDisabled?: boolean;
    title?: string;
    layout?: 'suits' | 'flat';
    cardSize?: 'small' | 'medium' | 'large';
    maxSelection?: number;
    showAsGrid?: boolean;
}

export const CardDeck: React.FC<CardDeckProps> = ({
    deck,
    selectedCards,
    onSelectCard,
    isDisabled = false,
    title = 'Available Cards',
    layout = 'suits',
    cardSize = 'medium',
    maxSelection,
    showAsGrid = true
}) => {
    const getCardSizeClass = () => {
        switch (cardSize) {
            case 'small': return 'w-12 sm:w-14';
            case 'large': return 'w-20 sm:w-24';
            default: return 'w-16 sm:w-20';
        }
    };

    const getGridClass = () => {
        if (!showAsGrid) return 'flex flex-wrap gap-1 sm:gap-2';
        return 'grid grid-cols-7 sm:grid-cols-10 md:grid-cols-13 gap-1 sm:gap-2';
    };

    const isCardSelected = (card: Card) => selectedCards.some(sc => sc.id === card.id);
    const isCardDisabled = (card: Card) => {
        if (isDisabled) return true;
        if (maxSelection && selectedCards.length >= maxSelection && !isCardSelected(card)) return true;
        return false;
    };

    const renderCardWithWrapper = (card: Card) => {
        const selected = isCardSelected(card);
        const disabled = isCardDisabled(card);

        return (
            <div
                key={card.id}
                className={`transform transition-transform ${!disabled ? 'hover:scale-110 cursor-pointer' : 'opacity-70'
                    }`}
            >
                <CardComponent
                    card={card}
                    onClick={onSelectCard}
                    isSelected={selected}
                    isDisabled={disabled}
                    className={getCardSizeClass()}
                />
            </div>
        );
    };

    if (layout === 'flat') {
        return (
            <div className="p-4 bg-gray-700 bg-opacity-30 backdrop-blur-sm shadow-xl rounded-lg w-full max-w-5xl mt-4">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-200">
                    {title}
                </h2>
                <div className={getGridClass()}>
                    {deck.map(renderCardWithWrapper)}
                </div>
            </div>
        );
    }

    // Suits layout (default)
    return (
        <div className="p-4 bg-gray-700 bg-opacity-30 shadow-xl rounded-lg w-full max-w-5xl mt-4">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-200">
                {title}
            </h2>
            {SUITS.map(suit => (
                <div key={suit} className="mb-3">
                    <div className={getGridClass()}>
                        {deck.filter(card => card.suit === suit).map(renderCardWithWrapper)}
                    </div>
                </div>
            ))}
        </div>
    );
}; 