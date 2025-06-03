import { ServerCard, ServerQuestionCategory, ServerQuestionInputType, ServerAnswerValueType } from './game.types';

export interface ServerQuestion {
    id: string;
    text: string;
    category: ServerQuestionCategory;
    answerType: ServerAnswerValueType;
    requiresInput?: ServerQuestionInputType;
    numberOfInputs?: number;
    // Actual server-side calculation logic, now with params
    calculateAnswer: (series: ServerCard[], params?: any) => any; // Return type is now any
} 