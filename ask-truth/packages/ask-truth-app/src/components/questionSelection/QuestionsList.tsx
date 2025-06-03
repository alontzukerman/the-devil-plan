import React from 'react';
import QuestionListItem from '../QuestionListItem';
import type { QuestionsListProps } from '../../utils/types/questionSelection.types';

export const QuestionsList: React.FC<QuestionsListProps> = ({
    questions,
    selectedQuestionId,
    onSelectQuestion,
    isDisabled
}) => {
    return (
        <div className="space-y-3 mb-6">
            {questions.map((question) => (
                <QuestionListItem
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={onSelectQuestion}
                    isSubmitted={isDisabled}
                />
            ))}
        </div>
    );
}; 