import React from 'react';
import type { Question } from '../utils/questions';
import type { QuestionInputParameters } from '../utils/questions'; // Updated import path

interface QuestionInputRendererProps {
    question: Question;
    currentParams: QuestionInputParameters;
    onParamsChange: (newParams: QuestionInputParameters) => void;
    isSubmitting: boolean;
}

const QuestionInputRenderer: React.FC<QuestionInputRendererProps> = ({ question, currentParams, onParamsChange, isSubmitting }) => {
    if (!question.requiresInput || question.requiresInput === 'NONE') {
        return null; // No input required, render nothing
    }

    const handlePositionSelect = (index: number) => {
        const currentPositions = currentParams.positions || [];
        let newPositions: number[];
        if (currentPositions.includes(index)) {
            newPositions = currentPositions.filter((p: number) => p !== index);
        } else {
            if (question.numberOfInputs && currentPositions.length < question.numberOfInputs) {
                newPositions = [...currentPositions, index];
            } else {
                newPositions = currentPositions; // Max selections reached or no limit (should not happen if numberOfInputs is set)
            }
        }
        onParamsChange({ ...currentParams, positions: newPositions.sort((a: number, b: number) => a - b) });
    };

    switch (question.requiresInput) {
        case 'CARD_POSITIONS':
            return (
                <div className="mt-2">
                    <p className="text-sm text-gray-300 mb-3">
                        Select exactly <span className="font-semibold text-amber-300">{question.numberOfInputs}</span> card position(s) from the opponent's hand (1-8):
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <button
                                key={`pos-input-${index}`}
                                onClick={() => handlePositionSelect(index)}
                                className={`w-12 h-12 border-2 rounded flex items-center justify-center font-mono transition-colors 
                                    ${(currentParams.positions || []).includes(index)
                                        ? 'bg-amber-500 border-amber-400 text-slate-800 font-semibold'
                                        : 'bg-slate-500 border-slate-400 hover:bg-slate-400 text-white'}
                                    ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}
                                `}
                                disabled={isSubmitting}
                            >
                                {index + 1} {/* Display 1-8 */}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                        Selected: {(currentParams.positions || []).map((p: number) => p + 1).join(', ') || 'None'}
                    </p>
                </div>
            );
        // Add cases for other input types like 'CARD_SHAPE', 'CARD_VALUE' etc. later
        // case 'CARD_SHAPE':
        // return <div>Render shape selection UI here</div>;
        default:
            return (
                <p className="text-sm text-yellow-500 italic">
                    Input UI for "{question.requiresInput}" is not implemented yet.
                </p>
            );
    }
};

export default QuestionInputRenderer; 