import React from 'react';
import type { Question, QuestionId } from '../utils/questions';

interface QuestionListItemProps {
    question: Question;
    onSelect: (questionId: QuestionId) => void;
    isSelected: boolean;
    isSubmitted: boolean; // To disable after submission while waiting for answer
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({ question, onSelect, isSelected, isSubmitted }) => {
    const handleSelect = () => {
        if (!isSubmitted) {
            onSelect(question.id);
        }
    };

    return (
        <div
            className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out 
                ${isSubmitted ? 'bg-neutral-600 opacity-50 cursor-not-allowed' : 'hover:bg-neutral-600'} 
                ${isSelected && !isSubmitted ? 'bg-info bg-opacity-20 border-info ring-2 ring-info ring-opacity-40' : 'border-neutral-500 bg-neutral-700'}
            `}
            onClick={handleSelect}
            aria-disabled={isSubmitted}
            role="button"
            tabIndex={isSubmitted ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(); }}
        >
            <h3 className={`text-lg font-semibold ${isSelected && !isSubmitted ? 'text-white' : 'text-info'}`}>{question.text}</h3>
            <p className={`text-sm ${isSelected && !isSubmitted ? 'text-info' : 'text-neutral-400'} mt-1`}>
                Category: <span className="font-medium">{question.category}</span>
                {question.requiresInput && question.requiresInput !== 'NONE' && (
                    <span className="ml-2 pl-2 border-l border-neutral-500">
                        Requires Input: {question.requiresInput} (x{question.numberOfInputs || 1})
                    </span>
                )}
            </p>
        </div>
    );
};

export default QuestionListItem; 