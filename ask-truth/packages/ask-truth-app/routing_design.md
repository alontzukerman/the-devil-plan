# Application Routing Design

## 1. Overview

This document outlines the client-side routing strategy for the "Ask or Truth" game application using `react-router-dom`.

## 2. Core Routes

1.  **`/` (Root Path)**
    *   **Component:** `StartScreen.tsx`
    *   **Purpose:** Entry point for players. Allows creating a new game or joining an existing one.
    *   **Navigation From:** None (initial route).
    *   **Navigation To:** `/game/:gameId/select-cards` (on successful game creation/join and when both players are ready for card selection).

2.  **`/game/:gameId/select-cards`**
    *   **Component:** `CardSelectionScreen.tsx` (to be created)
    *   **Purpose:** Screen where each player secretly selects their 8-card series.
    *   **URL Parameters:** `gameId` - The unique identifier for the current game session.
    *   **Navigation From:** `StartScreen` (triggered by a server event like `navigateToGameSetup` or `navigateToCardSelection`).
    *   **Navigation To:** `/game/:gameId/play` (once both players have confirmed their card selections).

3.  **`/game/:gameId/play`**
    *   **Component:** `GameScreen.tsx` (to be created)
    *   **Purpose:** The main gameplay screen where players bid, ask questions, or attempt to guess the series.
    *   **URL Parameters:** `gameId` - The unique identifier for the current game session.
    *   **Navigation From:** `CardSelectionScreen` (triggered by a server event like `allPlayersReadyStartGame`).
    *   **Navigation To:** `/game/:gameId/results` (when a player correctly guesses the series or another win condition is met).

4.  **`/game/:gameId/results` (Optional/Future)**
    *   **Component:** `ResultsScreen.tsx` (to be created)
    *   **Purpose:** Displays the game outcome, winner, and perhaps options to play again.
    *   **URL Parameters:** `gameId` - The unique identifier for the game session that just ended.
    *   **Navigation From:** `GameScreen`.
    *   **Navigation To:** `/` (if playing again or exiting).

## 3. Implementation Notes

*   **Router Setup:** The main router (`BrowserRouter`) will be set up in `src/main.tsx` or `src/App.tsx` to wrap the application.
*   **Route Definitions:** `<Routes>` and `<Route>` components will be used in `App.tsx` to define the path-to-component mappings.
*   **Navigation:** Programmatic navigation (e.g., after socket events) will be handled using the `useNavigate` hook from `react-router-dom`.
*   **Protected Routes/State-based Navigation:** Access to game-specific routes (like `/game/...`) should ideally depend on the player being part of an active game session. This can be managed through application state (e.g., Zustand store holding `gameId`, `playerId`). If a player tries to access a game route directly without being in a game, they could be redirected to the root `/`.

## 4. Socket.IO and Navigation

Several socket events will trigger navigation:

*   **`StartScreen` -> `CardSelectionScreen`:** Triggered by a server event (e.g., `navigateToGameSetup` or `navigateToCardSelection` which we used in `StartScreen.tsx`) once two players are in a room.
*   **`CardSelectionScreen` -> `GameScreen`:** Triggered by a server event (e.g., `allPlayersReadyStartGame`) once both players have submitted their card series.
*   **`GameScreen` -> `ResultsScreen`:** Triggered by game logic determining a winner.

*(This document will be updated as the routing requirements evolve.)* 