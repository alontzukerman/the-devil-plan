import React from 'react';
import { CardDeck as SharedCardDeck } from '../shared/CardDeck';
import type { CardType as Card } from '@ask-truth/ui';

interface CardDeckProps {
    deck: Card[];
    selectedSeries: Card[];
    hasConfirmedSelection: boolean;
    onSelectCard: (card: Card) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({
    deck,
    selectedSeries,
    hasConfirmedSelection,
    onSelectCard
}) => {
    return (
        <SharedCardDeck
            deck={deck}
            selectedCards={selectedSeries}
            onSelectCard={onSelectCard}
            isDisabled={hasConfirmedSelection}
            title="Available Cards"
            layout="suits"
            maxSelection={8}
        />
    );
}; 