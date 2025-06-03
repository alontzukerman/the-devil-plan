import type { Question, QuestionId, QuestionInputParameters, ClientAskedQuestionInfo } from '../questions';

export interface QuestionSelectionLocationState {
    gameId?: string;
}

export interface QuestionSelectionState {
    selectedQuestionId: QuestionId | null;
    selectedQuestionFull: Question | null;
    inputParams: QuestionInputParameters;
    showAnswer: ClientAskedQuestionInfo | null;
    isSubmitting: boolean;
    submissionError: string | null;
}

export interface QuestionAnsweredData extends ClientAskedQuestionInfo {
    gameId: string;
}

export interface ErrorToClientData {
    message: string;
}

export interface QuestionSubmissionData {
    gameId: string;
    questionId: QuestionId;
    params?: QuestionInputParameters;
}

export interface AnswerDisplayProps {
    answerData: ClientAskedQuestionInfo;
    onNavigateBack: () => void;
}

export interface QuestionsListProps {
    questions: Question[];
    selectedQuestionId: QuestionId | null;
    onSelectQuestion: (questionId: QuestionId) => void;
    isDisabled: boolean;
}

export interface SelectedQuestionInputProps {
    question: Question;
    currentParams: QuestionInputParameters;
    onParamsChange: (params: QuestionInputParameters) => void;
    isSubmitting: boolean;
}

export interface QuestionSubmissionControlsProps {
    canSubmit: boolean;
    isSubmitting: boolean;
    showAnswer: boolean;
    onSubmit: () => void;
}

export interface ErrorDisplayProps {
    error: string | null;
} 