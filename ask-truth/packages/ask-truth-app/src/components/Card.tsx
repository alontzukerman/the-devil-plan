import React from 'react';
import { Card as ThemedCard } from '@ask-truth/ui';
import type { CardType } from '@ask-truth/ui';

// Re-export the types for backward compatibility
export type { CardType as Card } from '@ask-truth/ui';

interface CardProps {
    card: CardType;
    onClick: (card: CardType) => void;
    isSelected?: boolean; // Is this card part of the currently selected series by the player
    isDisabled?: boolean; // Is this card already picked and thus disabled in the main deck display
    className?: string;   // Allow for additional custom styling
}

const CardComponent: React.FC<CardProps> = (props) => {
    return <ThemedCard {...props} />;
};

export default CardComponent; 