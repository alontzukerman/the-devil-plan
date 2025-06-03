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

    const baseStyles = [
        'p-2 border rounded-md shadow-sm',
        'flex items-center justify-center',
        'aspect-[2.5/3.5] min-w-[50px]',
        'text-lg font-semibold',
        'transition-all duration-150 ease-in-out',
    ];

    const interactionStyles = onClick && !isDisabled
        ? ['cursor-pointer', 'hover:shadow-lg']
        : isDisabled
            ? ['cursor-not-allowed']
            : [];

    const stateStyles = isSelected
        ? [
            'bg-secondary-100 border-secondary-500',
            'ring-2 ring-secondary-500',
            'hover:shadow-md',
        ]
        : isDisabled
            ? [
                'bg-neutral-200 text-neutral-400',
                'border-neutral-300',
            ]
            : [
                'bg-white border-neutral-300',
                'hover:border-secondary-500',
            ];

    const textColorStyles = isDisabled
        ? 'text-neutral-400'
        : isRed
            ? 'text-red-600'
            : 'text-neutral-900';

    const handleClick = () => {
        if (onClick && !isDisabled) {
            onClick(card);
        }
    };

    return (
        <div
            className={clsx(
                baseStyles,
                interactionStyles,
                stateStyles,
                textColorStyles,
                className
            )}
            onClick={handleClick}
            aria-disabled={isDisabled}
            title={cardText}
            style={{
                // Use CSS custom properties from theme
                backgroundColor: isSelected
                    ? `var(--color-secondary-100)`
                    : isDisabled
                        ? `var(--color-neutral-200)`
                        : 'white',
                borderColor: isSelected
                    ? `var(--color-secondary-500)`
                    : `var(--color-neutral-300)`,
            }}
        >
            <span className="select-none">{cardText}</span>
        </div>
    );
}; 