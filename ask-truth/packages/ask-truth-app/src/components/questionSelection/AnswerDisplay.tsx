import React from 'react';
import type { AnswerDisplayProps } from '../../utils/types/questionSelection.types';

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerData }) => {
    const formatAnswer = (answer: unknown): string => {
        if (typeof answer === 'boolean') {
            return answer ? 'TRUE' : 'FALSE';
        }
        return String(answer);
    };

    const getAnswerColorClass = (answer: unknown): string => {
        if (typeof answer === 'boolean') {
            return answer ? 'text-green-400' : 'text-red-400';
        }
        return 'text-yellow-300';
    };

    return (
        <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-700 p-8 rounded-lg shadow-xl text-center">
                <h1 className="text-3xl font-cinzel-decorative text-amber-400 mb-6">
                    Question Asked
                </h1>

                <p className="text-lg text-sky-200 mb-1">Your question:</p>
                <p className="text-xl font-semibold text-white mb-2">
                    "{answerData.questionText}"
                </p>

                {answerData.params && Object.keys(answerData.params).length > 0 && (
                    <p className="text-sm text-gray-400 mb-4">
                        Your input: {JSON.stringify(answerData.params)}
                    </p>
                )}

                <p className="text-lg text-sky-200 mb-3">The answer is:</p>
                <p className={`text-4xl font-bold mb-8 ${getAnswerColorClass(answerData.answer)}`}>
                    {formatAnswer(answerData.answer)}
                </p>

                <p className="text-sm text-gray-400">
                    Returning to bidding screen...
                </p>
            </div>
        </div>
    );
}; 