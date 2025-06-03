import React from 'react';

interface SeriesCounterProps {
    selectedCount: number;
    maxCount: number;
}

export const SeriesCounter: React.FC<SeriesCounterProps> = ({
    selectedCount,
    maxCount = 8
}) => {
    return (
        <p className="my-2 text-lg font-medium text-gray-200">
            Selected: {selectedCount} / {maxCount} cards
        </p>
    );
}; 