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

    const handleClick = () => {
        if (onClick && !isDisabled) {
            onClick(card);
        }
    };

    // Get colors from theme
    const getCardColors = () => {
        if (isDisabled) {
            return {
                backgroundColor: theme.colors.neutral[200],
                borderColor: theme.colors.neutral[300],
                textColor: theme.colors.neutral[400],
            };
        }

        if (isSelected) {
            return {
                backgroundColor: theme.colors.secondary[100],
                borderColor: theme.colors.secondary[500],
                textColor: isRed ? '#dc2626' : '#1f2937', // red-600 for red cards, gray-800 for black cards
            };
        }

        return {
            backgroundColor: '#ffffff',
            borderColor: theme.colors.neutral[300],
            textColor: isRed ? '#dc2626' : '#1f2937', // red-600 for red cards, gray-800 for black cards
        };
    };

    const colors = getCardColors();

    return (
        <div
            className={clsx(
                baseStyles,
                interactionStyles,
                className
            )}
            onClick={handleClick}
            aria-disabled={isDisabled}
            title={cardText}
            style={{
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                color: colors.textColor,
                boxShadow: isSelected ? `0 0 0 2px ${theme.colors.secondary[500]}` : undefined,
            }}
        >
            <span className="select-none">{cardText}</span>
        </div>
    );
}; 