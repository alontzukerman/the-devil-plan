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
        // Base styles - NARROW width, EXTRA TALL height
        'relative p-1 border-2 rounded-md shadow-md',
        'flex items-center justify-center',
        'w-5 h-16', // NARROW width (20px) and EXTRA TALL height (64px)
        'text-xs font-bold',
        'transition-all duration-200 ease-out',
        'transform-gpu',
        'flex-shrink-0', // Prevent shrinking in flex containers
        'mx-0.5', // Add horizontal margin to prevent overlap

        // Background and border colors based on state
        {
            // Selected state - More prominent with glow effect
            'bg-secondary-50 border-secondary-400 ring-1 ring-secondary-200 shadow-lg shadow-secondary-200/50 scale-110 z-10': isSelected,

            // Disabled state - Softer appearance
            'bg-neutral-100 border-neutral-300 text-neutral-400 opacity-60': isDisabled,

            // Normal state - Clean white with subtle effects
            'bg-white border-neutral-200 hover:border-secondary-300 hover:shadow-lg hover:shadow-neutral-200/50 hover:-translate-y-1 hover:z-10': !isSelected && !isDisabled,
        },

        // Text colors for suits - Enhanced contrast
        {
            'card-red': isRed && !isDisabled,
            'card-black': !isRed && !isDisabled,
        },

        // Interaction styles
        {
            'cursor-pointer hover:scale-105': onClick && !isDisabled,
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
            <span className="select-none text-center leading-tight">
                {cardText}
            </span>

            {/* Subtle inner glow for selected cards */}
            {isSelected && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-secondary-100/30 to-transparent pointer-events-none" />
            )}
        </div>
    );
}; 