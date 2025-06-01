export type QuestionCategory = 'SUM' | 'COUNT' | 'POSITION' | 'GENERAL';
export type QuestionInputType = 'NONE' | 'CARD_POSITIONS' | 'CARD_SHAPE' | 'CARD_VALUE' | 'SPECIFIC_CARD';
export type AnswerValueType = 'BOOLEAN' | 'NUMBER' | 'STRING_ARRAY' | 'POSITION_ARRAY' | 'STRING';

export interface Question {
    id: string;
    text: string;
    category: QuestionCategory;
    answerType: AnswerValueType; // What kind of value the answer will be
    requiresInput?: QuestionInputType; // What kind of additional input is needed
    numberOfInputs?: number; // e.g., 3 for 3 card positions
}

// Moved from QuestionSelectionScreen for broader use
export type PossibleAnswerType = boolean | number | string[] | string; // string[] for POSITION_ARRAY for now

export interface QuestionInputParameters {
    positions?: number[];      // For CARD_POSITIONS (0-indexed)
    shape?: string;            // For CARD_SHAPE (e.g., 'H', 'D')
    cardValue?: number;        // For CARD_VALUE (e.g., rank 1-13)
    specificCard?: { suit: string; rank: number }; // For SPECIFIC_CARD
}

// Comprehensive type for asked question info on the client
export interface ClientAskedQuestionInfo {
    questionId: string;
    questionText: string;
    answer: PossibleAnswerType;
    params?: QuestionInputParameters;
    answeredByPlayerId: string;
    askedByPlayerId: string;
}

export const PREDEFINED_QUESTIONS: Question[] = [
    {
        id: "SUM_THREE_SELECTED_POSITIONS",
        text: "Select 3 card positions. What is the total value of the cards at these positions?",
        category: "SUM",
        answerType: "NUMBER",
        requiresInput: "CARD_POSITIONS",
        numberOfInputs: 3,
    },
    {
        id: "SAMPLE_HIGHEST_CARD_FACE", // Original sample question, re-categorized
        text: "Is the highest card in your series a face card (King, Queen, or Jack)?",
        category: "GENERAL",
        answerType: "BOOLEAN",
        requiresInput: "NONE",
    },
    // We will add more questions here later
];

// QuestionId type definition is now after PREDEFINED_QUESTIONS
export type QuestionId = typeof PREDEFINED_QUESTIONS[number]['id']; 