# Start/Setup Screen Design (`StartScreen.tsx`)

## 1. Overview

This screen is the entry point for players. It allows them to either initiate a new game session or join an existing one created by another player. The game is designed for two players on separate devices, communicating via a backend server.

## 2. UI Elements

1.  **Main Container:** A centrally aligned container on the page.
    *   Tailwind: `flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4`

2.  **Game Title (Optional but Recommended):**
    *   Text: "Ask or Truth"
    *   Tailwind: `text-4xl font-bold text-blue-600 mb-8`

3.  **Player Name Input:**
    *   Label: "Enter Your Name:"
    *   Input Field: Text input for the player's name.
    *   State: Will be stored locally (e.g., using `useState`) and sent to the server upon creating/joining a game.
    *   Tailwind (Label): `text-lg font-medium mb-2`
    *   Tailwind (Input): `p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-6 w-full max-w-xs`

4.  **Create New Game Section:**
    *   Button: "Create New Game"
    *   Action: 
        1.  Sends player's name to the backend to initiate a new game session.
        2.  Backend responds with a unique Game ID.
        3.  UI displays this Game ID (e.g., "Share this Game ID with your friend: XXXXXX").
        4.  Player waits for the opponent to join. UI might show a "Waiting for opponent..." message.
        5.  Once opponent joins (signaled by server), navigate to the Card Selection Screen (or directly to Game Screen if card selection is part of initial setup).
    *   Tailwind (Button): `bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full max-w-xs mb-4`
    *   Tailwind (Game ID Display): `text-md text-gray-700 mb-2`
    *   Tailwind (Waiting Message): `text-md text-gray-600 italic`

5.  **Separator (Optional):**
    *   Text: "OR"
    *   Tailwind: `text-lg font-medium my-4`

6.  **Join Existing Game Section:**
    *   Label: "Enter Game ID to Join:"
    *   Input Field: Text input for the Game ID.
    *   Button: "Join Game"
    *   Action:
        1.  Sends player's name and the entered Game ID to the backend.
        2.  Backend attempts to join the game session.
        3.  If successful, both players (creator and joiner) are navigated to the Card Selection Screen (or Game Screen).
        4.  If unsuccessful (e.g., game ID not found, room full), display an error message.
    *   Tailwind (Label): `text-lg font-medium mb-2`
    *   Tailwind (Input): `p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2 w-full max-w-xs`
    *   Tailwind (Button): `bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full max-w-xs`
    *   Tailwind (Error Message): `text-red-500 text-sm mt-2`

## 3. State Management (High-Level)

*   **Local State (React `useState`):**
    *   Player Name input value.
    *   Game ID input value (for joining).
    *   Displayed Game ID (after creating).
    *   UI status messages (e.g., "Waiting for opponent...", error messages).
*   **Global State (Zustand - to be connected with Socket.IO later):**
    *   Current game state (e.g., `gameId`, `playerId`, `opponentName`, `currentScreen`).
    *   Socket connection status.

## 4. Socket.IO Interactions (High-Level)

*   **Emitting Events:**
    *   `createGame` (with playerName)
    *   `joinGame` (with playerName, gameId)
*   **Listening for Events:**
    *   `gameCreated` (with gameId, playerId) - from server to game creator
    *   `playerJoined` (with opponentName, updatedGameState) - from server to both players
    *   `gameJoinError` (with errorMessage) - from server to joiner
    *   `navigateToCardSelection` (or `navigateToGame`) - from server to both players when room is ready.

## 5. Navigation

*   On successful game creation and opponent joining, or successful game join: Navigate to the next screen (e.g., Card Selection Screen or directly to the main Game Screen).

*(This document will be updated as the design evolves.)* 