import React from 'react';
// Use type-only import for CardType as per verbatimModuleSyntax
import type { Card as CardType } from '../utils/cardUtils';
import { getCardDisplayString } from '../utils/cardUtils';

interface CardProps {
    card: CardType;
    onClick: (card: CardType) => void;
    isSelected?: boolean; // Is this card part of the currently selected series by the player
    isDisabled?: boolean; // Is this card already picked and thus disabled in the main deck display
    className?: string;   // Allow for additional custom styling
}

const CardComponent: React.FC<CardProps> = ({
    card,
    onClick,
    isSelected = false,
    isDisabled = false,
    className = ''
}) => {
    const cardText = getCardDisplayString(card);
    const isRed = card.suit === 'H' || card.suit === 'D';

    let baseStyle = 'p-2 border rounded-md shadow-sm cursor-pointer flex items-center justify-center aspect-[2.5/3.5] min-w-[50px] text-lg font-semibold';
    let textColor = isRed ? 'text-red-600' : 'text-black';
    let bgColor = 'bg-white';
    let hoverStyle = 'hover:shadow-lg hover:border-blue-500';

    if (isSelected) { // Card is in the player's currently selected 8-card series display
        bgColor = 'bg-blue-100';
        baseStyle += ' border-blue-500 ring-2 ring-blue-500';
        hoverStyle = 'hover:shadow-md'; // Less pronounced hover for already selected cards
    } else if (isDisabled) { // Card is in the main deck display but already chosen for the series
        bgColor = 'bg-gray-200';
        textColor = 'text-gray-400';
        baseStyle = baseStyle.replace('cursor-pointer', 'cursor-not-allowed');
        hoverStyle = ''; // No hover effect for disabled cards
    }

    const handleClick = () => {
        if (!isDisabled) {
            onClick(card);
        }
    };

    return (
        <div
            className={`${baseStyle} ${bgColor} ${textColor} ${hoverStyle} ${className}`.trim()}
            onClick={handleClick}
            aria-disabled={isDisabled}
            title={cardText}
        >
            {/* Display text, suit symbols could be enhanced later with SVGs or images */}
            <span className="select-none">{cardText}</span>
        </div>
    );
};

export default CardComponent; 