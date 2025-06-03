import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';

// Services
import { GameService } from './services/GameService';
import { BiddingService } from './services/BiddingService';
import { QuestionService } from './services/QuestionService';
import { TruthService } from './services/TruthService';

// Handlers
import { createGameHandlers } from './handlers/gameHandlers';
import { createBiddingHandlers } from './handlers/biddingHandlers';
import { createQuestionHandlers } from './handlers/questionHandlers';
import { createTruthHandlers } from './handlers/truthHandlers';

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = ['http://localhost:5173']; // Adjust if your React app runs on a different port
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin!) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new SocketIOServer(server, {
    cors: corsOptions
});

const STARTING_COINS = 10;
const BIDDING_TIMER_DURATION = 10; // seconds
const COINS_AWARDED_PER_ROUND = 2;
const LOW_COIN_THRESHOLD = 5;

// Mirrored types from client for server-side question definitions
export type ServerQuestionCategory = 'SUM' | 'COUNT' | 'POSITION' | 'GENERAL';
export type ServerQuestionInputType = 'NONE' | 'CARD_POSITIONS' | 'CARD_SHAPE' | 'CARD_VALUE' | 'SPECIFIC_CARD';
export type ServerAnswerValueType = 'BOOLEAN' | 'NUMBER' | 'STRING_ARRAY' | 'POSITION_ARRAY' | 'STRING';

interface ServerQuestion {
    id: string;
    text: string;
    category: ServerQuestionCategory;
    answerType: ServerAnswerValueType;
    requiresInput?: ServerQuestionInputType;
    numberOfInputs?: number;
    // Actual server-side calculation logic, now with params
    calculateAnswer: (series: ServerCard[], params?: any) => any; // Return type is now any
}

const SERVER_PREDEFINED_QUESTIONS: ServerQuestion[] = [
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

// Card type - mirrors client-side but used for server-side logic
// The client will send CardType[] where CardType has id, suit, rank.
interface ServerCard {
    id: string; // Client-generated unique ID for the card instance
    suit: string; // 'H', 'D', 'C', 'S'
    rank: number; // 1-13 (A-K)
}

interface Player {
    id: string; // socket.id
    name: string;
    // We can add more player-specific game data here later
}

interface AskedQuestionInfo {
    questionId: string;
    questionText: string;
    answer: any; // Changed from boolean to any to support various answer types
    params?: any; // To store input parameters like selected positions, shape, etc.
    answeredByPlayerId: string; // The ID of the player whose series was interrogated
    askedByPlayerId: string; // The ID of the player who asked the question (bid winner)
}

interface Game {
    id: string;
    players: Player[];
    playerSelectedSeries: Record<string, ServerCard[]>; // PlayerID -> selected 8-card series
    playerCoins: Record<string, number>;          // PlayerID -> coin count
    currentBids: Record<string, number>;           // PlayerID -> submitted bid for the current round
    bidsSubmittedThisRound: Set<string>;         // Set of PlayerIDs who have submitted bids this round
    playersReadyForBidding: Set<string>;
    currentBidWinnerId?: string; // Stores who won the last bid
    currentPhase: 'cardSelection' | 'bidding' | 'truthGuessing' | 'askQuestion' | 'gameOver';
    askedQuestions: AskedQuestionInfo[]; // To store history of asked questions and answers
}

const games: Record<string, Game> = {};

const generateGameId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Ask or Truth Server is running!');
});

// Initialize services
const gameService = new GameService();
const biddingService = new BiddingService(io);
const questionService = new QuestionService(io, biddingService);
const truthService = new TruthService(io, biddingService);

// Initialize handlers
const gameHandlers = createGameHandlers(io, gameService, biddingService);
const biddingHandlers = createBiddingHandlers(gameService, biddingService);
const questionHandlers = createQuestionHandlers(gameService, questionService);
const truthHandlers = createTruthHandlers(gameService, truthService);

io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Register all handlers
    gameHandlers.createGame(socket);
    gameHandlers.joinGame(socket);
    gameHandlers.playerSelectedSeries(socket);
    gameHandlers.clientReadyForBidding(socket);
    gameHandlers.disconnect(socket);

    biddingHandlers.submitFinalBid(socket);

    questionHandlers.playerMadeChoice(socket);
    questionHandlers.playerSelectedQuestion(socket);

    truthHandlers.submitTruthGuess(socket);
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 