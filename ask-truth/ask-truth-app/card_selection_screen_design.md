# Card Selection Screen Design (`CardSelectionScreen.tsx`)

## 1. Overview

This screen appears after two players have successfully joined a game. Each player will independently and secretly select their 8-card series from a standard 52-card deck. The selection must adhere to the game's rules (cards of the same suit are ordered by rank).

## 2. UI Elements

1.  **Main Container:** Full-screen layout.
    *   Tailwind suggestion: `flex flex-col items-center p-4 bg-gray-50 min-h-screen`

2.  **Player/Game Info Header:**
    *   Display current player's name.
    *   Display opponent's name (optional, or just a generic "Opponent").
    *   Display Game ID.
    *   Tailwind suggestion: `w-full max-w-4xl mx-auto mb-4 p-3 bg-white shadow rounded-lg flex justify-between items-center`

3.  **Instructions Area:**
    *   Text: "Select your 8-card secret series. Click on a card to add it to your series. Click again on a selected card (in your series display) to remove it. Cards of the same suit will be automatically ordered."
    *   Tailwind suggestion: `mb-4 text-center text-gray-700`

4.  **Available Cards Display (The Deck):**
    *   A visual representation of all 52 cards, likely grouped by suit (Hearts, Diamonds, Clubs, Spades).
    *   Each card should be a clickable component.
    *   When a card is selected and part of the player's 8-card series, it should be visually distinct in this area (e.g., grayed out, reduced opacity) to prevent re-selection for the current series.
    *   Tailwind suggestion (for a suit group): `mb-3 p-2 bg-white shadow rounded`
    *   Tailwind suggestion (card grid): `grid grid-cols-7 sm:grid-cols-10 md:grid-cols-13 gap-1` (adjust col count based on card size)

5.  **Player's Selected Series Display:**
    *   A dedicated area showing the cards the player has currently chosen for their 8-card series.
    *   **Dynamic Sorting:** This display MUST automatically sort the selected cards based on the rule: cards of the same suit are ordered from lowest to highest rank. The overall order of suits doesn't matter, only the internal order of cards within each suit present in the selection.
    *   Maximum of 8 cards can be shown here.
    *   Clicking a card in this display should remove it from the selected series and make it available again in the deck area.
    *   Tailwind suggestion: `h-24 flex items-center justify-center p-3 my-4 bg-white shadow-lg rounded-lg border w-full max-w-2xl space-x-1 overflow-x-auto`

6.  **Selection Counter:**
    *   Text: "Selected: X / 8 cards"
    *   Tailwind suggestion: `my-2 text-lg font-medium text-gray-800`

7.  **Action Buttons:**
    *   **"Confirm Selection" Button:**
        *   Enabled only when exactly 8 cards are selected.
        *   When clicked: 
            1.  Sends the player's final 8-card series to the backend.
            2.  The UI should then show a "Waiting for opponent to confirm..." message.
            3.  The card selection areas (deck and selected series) might become non-interactive.
        *   Tailwind suggestion: `bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg transition duration-150`
    *   **"Reset Selection" Button (Optional but Recommended):**
        *   Clears all currently selected cards from the player's series display, making them available again in the deck.
        *   Tailwind suggestion: `bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded`

8.  **Status/Waiting Message Area:**
    *   Displays messages like "Waiting for opponent to confirm their selection..." after the current player confirms.
    *   Tailwind suggestion: `mt-4 text-xl text-purple-700 italic`

## 3. Card Representation

*   **Data Structure:** Each card will be an object, e.g., `{ suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades', rank: number }`.
    *   `suit`: String representing the suit (e.g., 'Hearts', 'Diamonds', 'Clubs', 'Spades'). We can use full names or single characters like 'H', 'D', 'C', 'S'. Let's decide on one when implementing.
    *   `rank`: Number representing the card's rank.
        *   Ace (A) = 1
        *   Numbered cards 2-10 = their respective number (2-10)
        *   Jack (J) = 11
        *   Queen (Q) = 12
        *   King (K) = 13
*   **Display Utility:** A utility function will be created to transform numeric ranks (1, 11, 12, 13) and suits into their display symbols (e.g., 'A♥', 'KH', '7♠') for UI purposes. For example, `{ suit: 'Hearts', rank: 13 }` might be displayed as "K♥".
*   **Component:** A reusable `Card.tsx` component will be needed to display individual cards. It should accept card data (suit, rank) as props and handle click events. It should have different visual states (available, selected in deck, part of chosen series).

## 4. State Management (High-Level)

*   **Local State (`useState` in `CardSelectionScreen.tsx`):**
    *   `deckCards`: An array of all 52 card objects, potentially with a flag indicating if they are currently part of the player's chosen series.
    *   `selectedSeries`: An array of up to 8 card objects representing the player's current selection. This array will be the source for the dynamically sorted display.
    *   `hasConfirmedSelection`: Boolean, true after the player clicks "Confirm Selection".
*   **Global State / Props (from router or context):**
    *   `gameId`, `playerId` (to interact with the backend).
*   **Socket-driven State Updates:**
    *   `opponentHasConfirmed`: Boolean, set to true when the server indicates the other player has confirmed their cards.

## 5. Socket.IO Interactions

*   **Emitting Events:**
    *   `submitCardSelection` (payload: `{ gameId: string, playerId: string, selectedCardSeries: CardObject[] }`)
*   **Listening for Events:**
    *   `opponentConfirmedSelection` (payload: `{ gameId: string, opponentPlayerId: string }`) -> Update UI to show opponent is ready.
    *   `allPlayersReadyStartGame` (payload: `{ gameId: string, gameState: InitialGameStateType }`) -> Server signals both players have confirmed; navigate to the main Game Screen.
    *   `playerDisconnectedDuringSetup` (payload: `{ gameId: string, disconnectedPlayerName: string }`) -> If opponent disconnects, show a message, perhaps option to go back to StartScreen.

## 6. Navigation

*   On receiving `allPlayersReadyStartGame` from the server, navigate to the main Game Screen (`GameScreen.tsx`).

*(This document will be updated as the design evolves.)* 