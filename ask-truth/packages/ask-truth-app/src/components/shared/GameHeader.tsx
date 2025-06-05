import React from 'react';

interface GameHeaderProps {
    title: string;
    className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    title,
    className = "text-4xl font-title text-center text-secondary-400 mb-6"
}) => {
    return (
        <h1 className={className}>
            {title}
        </h1>
    );
}; 