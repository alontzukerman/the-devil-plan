import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type Suit = 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
}

export interface CardProps {
    card: Card;
    onClick?: (card: Card) => void;
    isSelected?: boolean;
    isDisabled?: boolean;
    className?: string;
}

/**
 * Gets the display string for a card's rank.
 */
const getRankDisplayString = (rank: Rank): string => {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
};

/**
 * Gets the display symbol for a card's suit.
 */
const getSuitDisplaySymbol = (suit: Suit): string => {
    if (suit === 'H') return '♥';
    if (suit === 'D') return '♦';
    if (suit === 'C') return '♣';
    if (suit === 'S') return '♠';
    return suit;
};

/**
 * Gets the full display string for a card.
 */
const getCardDisplayString = (card: Card): string => {
    return `${getRankDisplayString(card.rank)}${getSuitDisplaySymbol(card.suit)}`;
};

export const Card: React.FC<CardProps> = ({
    card,
    onClick,
    isSelected = false,
    isDisabled = false,
    className,
}) => {
    const { theme } = useTheme();
    const cardText = getCardDisplayString(card);
    const isRed = card.suit === 'H' || card.suit === 'D';

    const handleClick = () => {
        if (onClick && !isDisabled) {
            onClick(card);
        }
    };

    const cardClasses = clsx(
        // Base styles
        'p-2 border rounded-md shadow-sm',
        'flex items-center justify-center',
        'aspect-[2.5/3.5] min-w-[50px]',
        'text-lg font-semibold',
        'transition-all duration-150 ease-in-out',

        // Background and border colors based on state
        {
            // Selected state
            'bg-secondary-100 border-secondary-500 ring-2 ring-secondary-500 hover:shadow-md': isSelected,

            // Disabled state  
            'bg-neutral-200 border-neutral-300 text-neutral-400': isDisabled,

            // Normal state
            'bg-white border-neutral-300 hover:border-secondary-500 hover:shadow-lg': !isSelected && !isDisabled,
        },

        // Text colors for suits
        {
            'card-red': isRed && !isDisabled,
            'card-black': !isRed && !isDisabled,
        },

        // Interaction styles
        {
            'cursor-pointer': onClick && !isDisabled,
            'cursor-not-allowed': isDisabled,
        },

        className
    );

    return (
        <div
            className={cardClasses}
            onClick={handleClick}
            aria-disabled={isDisabled}
            title={cardText}
        >
            <span className="select-none">{cardText}</span>
        </div>
    );
}; 