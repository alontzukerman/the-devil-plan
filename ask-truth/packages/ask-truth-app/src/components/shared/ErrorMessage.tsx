import React from 'react';

interface ErrorMessageProps {
    message: string | null;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    className = "mt-6 p-4 bg-red-700 bg-opacity-50 border-l-4 border-red-500 text-red-200 rounded-md shadow-md w-full max-w-md"
}) => {
    if (!message) {
        return null;
    }

    return (
        <div className={className}>
            <p className="font-semibold">Error:</p>
            <p>{message}</p>
        </div>
    );
}; 