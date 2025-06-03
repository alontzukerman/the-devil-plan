import type { Card, Suit, Rank } from '../../components/Card/Card';

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Generates a standard 52-card deck.
 */
export const generateDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({ id: `${suit}-${rank}`, suit, rank });
        });
    });
    return deck;
};

/**
 * Gets the display string for a card's rank.
 * e.g., 1 -> "A", 11 -> "J", 13 -> "K"
 */
export const getRankDisplayString = (rank: Rank): string => {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
};

/**
 * Gets the display symbol for a card's suit.
 * e.g., 'H' -> "♥"
 */
export const getSuitDisplaySymbol = (suit: Suit): string => {
    if (suit === 'H') return '♥';
    if (suit === 'D') return '♦';
    if (suit === 'C') return '♣';
    if (suit === 'S') return '♠';
    return suit;
};

/**
 * Gets the full display string for a card (e.g., "K♥").
 */
export const getCardDisplayString = (card: Card): string => {
    return `${getRankDisplayString(card.rank)}${getSuitDisplaySymbol(card.suit)}`;
};

/**
 * Sorts a player's selected series of cards according to the game rules:
 * - All cards of the same suit are grouped together.
 * - Within each suit group, cards are sorted by rank in ascending order.
 * - The order of the suit groups themselves does not matter for validity, 
 *   but for consistent display, we can sort them (e.g., H, D, C, S).
 */
export const sortSelectedSeries = (cards: Card[]): Card[] => {
    if (!cards || cards.length === 0) return [];

    // Group cards by suit
    const groupedBySuit: Record<Suit, Card[]> = {
        H: [], D: [], C: [], S: [],
    };

    cards.forEach(card => {
        groupedBySuit[card.suit].push(card);
    });

    let sortedSeries: Card[] = [];

    // Sort within each suit group and then concatenate
    const suitOrder: Suit[] = ['H', 'D', 'C', 'S']; // Consistent order

    suitOrder.forEach(suit => {
        if (groupedBySuit[suit].length > 0) {
            const sortedGroup = [...groupedBySuit[suit]].sort((a, b) => a.rank - b.rank);
            sortedSeries = sortedSeries.concat(sortedGroup);
        }
    });

    return sortedSeries;
};

/**
 * Validates if a selected series is valid according to game rules.
 */
export const isSeriesValid = (series: Card[]): boolean => {
    if (series.length > 8) return false; // Max 8 cards

    const suitMap: { [key in Suit]?: Rank[] } = {};

    for (const card of series) {
        if (!suitMap[card.suit]) {
            suitMap[card.suit] = [];
        }
        // Check if current card's rank is greater than the last card of the same suit
        const lastRankOfSuit = suitMap[card.suit]!.length > 0 ? suitMap[card.suit]![suitMap[card.suit]!.length - 1] : -1;
        if (card.rank <= lastRankOfSuit) {
            return false; // Invalid order within suit
        }
        suitMap[card.suit]!.push(card.rank);
    }
    return true;
}; 