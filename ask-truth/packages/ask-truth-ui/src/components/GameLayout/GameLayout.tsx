import React from 'react';
import { useTheme } from '../ThemeProvider';
import { Container } from '../Container';

export interface GameLayoutProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    backgroundVariant?: 'default' | 'dark' | 'game';
}

const backgroundVariants = {
    default: 'bg-white min-h-screen',
    dark: 'min-h-screen bg-neutral-800 text-white',
    game: 'min-h-screen bg-neutral-800 text-white',
};

export const GameLayout: React.FC<GameLayoutProps> = ({
    children,
    title,
    className = '',
    backgroundVariant = 'default',
}) => {
    const { theme } = useTheme();

    const layoutClasses = [
        backgroundVariants[backgroundVariant],
        'flex flex-col items-center justify-center p-4',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={layoutClasses}>
            {title && (
                <div className="mb-12 text-center">
                    <h1 className="font-title text-5xl text-secondary-400">
                        {title}
                    </h1>
                </div>
            )}
            <Container>
                {children}
            </Container>
        </div>
    );
}; 