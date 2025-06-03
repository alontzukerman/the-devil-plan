import React from 'react';
import type { ErrorDisplayProps } from '../../utils/types/questionSelection.types';

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    if (!error) return null;

    return (
        <div className="text-red-400 text-center my-4 p-2 bg-red-900/50 rounded">
            Error: {error}
        </div>
    );
}; 