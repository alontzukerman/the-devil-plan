import { ServerQuestion } from '../types';

export const SERVER_PREDEFINED_QUESTIONS: ServerQuestion[] = [
    {
        id: "SUM_THREE_SELECTED_POSITIONS",
        text: "Select 3 card positions. What is the total value of the cards at these positions?",
        category: "SUM",
        answerType: "NUMBER",
        requiresInput: "CARD_POSITIONS",
        numberOfInputs: 3,
        calculateAnswer: (series, params) => {
            // Placeholder logic: Actual logic will sum values at specified positions
            // Params would be e.g. { positions: [0, 2, 4] }
            console.log('[Server] Calculating answer for SUM_THREE_SELECTED_POSITIONS with params:', params, 'and series:', series);
            // For now, return a placeholder or handle if params/series are not as expected.
            if (!params || !params.positions || params.positions.length !== 3) return 0; // Or throw error
            // This is just a placeholder until real logic is implemented
            return 99; // Placeholder answer
        }
    },
    {
        id: "SAMPLE_HIGHEST_CARD_FACE",
        text: "Is the highest card in your series a face card (King, Queen, or Jack)?",
        category: "GENERAL",
        answerType: "BOOLEAN",
        requiresInput: "NONE",
        calculateAnswer: (series) => { // No params for this one
            console.log('[Server] Calculating answer for SAMPLE_HIGHEST_CARD_FACE for series:', series);
            // Placeholder for actual logic (e.g., find max rank, check if > 10)
            return true;
        }
    },
]; 