# Bidding Screen Design (`BiddingScreen.tsx`)

## 1. Objective

Players will secretly bid coins within a 10-second time limit using adjustment buttons. The bid is implicitly submitted when the timer ends. The highest bidder wins the right to choose "Ask" or "Truth." After bids are resolved, bid amounts are subtracted, and each player receives 2 coins. Information about an opponent having few coins is provided, but exact counts are hidden.

## 2. UI Elements

1.  **Header Information:**
    *   Game ID (from URL params).
    *   Current Player's Name.
    *   Opponent's Name.
2.  **Coin Display:**
    *   **Your Coins:** `[Your Name]: [Your Current Coins] coins`
    *   **Opponent's Status:**
        *   If opponent has > 5 coins: No specific coin message, just their name is present.
        *   If opponent has <= 5 coins: A message like "[Opponent's Name] has 5 or less coins." (Exact count is not revealed).
3.  **Bidding Timer:**
    *   Visual countdown, e.g., "Time left: **10s**". Updates every second.
4.  **Bidding Control Area:**
    *   Instructional text, e.g., "Adjust your bid. It will be submitted when time runs out."
    *   Display of current bid: "Your Bid: **[Amount]** coins".
    *   "-" (Decrease Bid) button:
        *   Disabled if current bid is 0.
        *   Disabled if `timeLeft` is 0.
    *   "+" (Increase Bid) button:
        *   Disabled if current bid equals `myCoins`.
        *   Disabled if `timeLeft` is 0.
5.  **Status & Results Area:**
    *   This central area will dynamically update:
        *   Initial: "Adjust your bid. Timer starting..." or "Bidding in progress..."
        *   When timer is low (e.g., <=3s): Timer color might change (e.g., to red).
        *   After timer expires and bids processed:
            *   "Bids are in! Calculating results..."
            *   Winner Announcement: "[Player Name] wins the bid!" or "Bids are tied! No winner this round." (Individual bid amounts are NOT shown).
        *   Coin Update Message (for current player): "Your coins: [Old Total] - [Your Submitted Bid] + 2 = [New Total]." (Opponent's specific bid or exact coin change is not detailed here to maintain secrecy from previous point).
6.  **Action Choice (Visible only to the Bid Winner):**
    *   If the current player is the bid winner:
        *   "Choose ASK" button.
        *   "Choose TRUTH" button.
    *   If the opponent is the bid winner:
        *   Message: "Waiting for [Opponent's Name] to choose Ask or Truth..."
    *   If bids are tied:
        *   Message: "Bids were tied. Proceeding to the next bidding round."

## 3. State Variables (`useState`)

*   `gameId`: string (from `useParams`).
*   `currentPlayerName`: string.
*   `opponentPlayerName`: string.
*   `myCoins`: number.
*   `opponentHasFewCoins`: boolean (true if server indicates opponent has <= 5 coins).
*   `currentBidAmount`: number (controlled by +/- buttons, defaults to 0).
*   `timeLeft`: number (seconds remaining, e.g., starts at 10).
*   `biddingStatusMessage`: string.
*   `bidOutcome`: object | null (e.g., `{ winnerId?: string, winnerName?: string, bidsTied: boolean, yourSubmittedBid: number }`). Winner's name for display. Own bid for coin calculation.
*   `canChooseAction`: boolean.
*   `isTimerActive`: boolean (to control button states and effects).

## 4. Socket Events

### Listeners (Incoming from Server):

1.  **`biddingPhaseState`** (or `updateBiddingRound`):
    *   **Payload:** `{ gameId: string, players: [{ id: string, name: string, coins: number }], opponentLowCoins: boolean, timerDuration: number, roundNumber?: number }`
        *   `players` array contains current player's data (ID, name, coins). Opponent's exact coins are not sent, only their name.
        *   `opponentLowCoins` is a boolean indicating if the opponent has <= 5 coins.
    *   **Action:** Initializes/updates `currentPlayerName`, `myCoins`, `opponentPlayerName`, `opponentHasFewCoins`. Resets `currentBidAmount` to 0, `canChooseAction`, `bidOutcome`. Starts `timeLeft` from `timerDuration` and sets `isTimerActive` to true. Updates `biddingStatusMessage`.
2.  **`biddingResolved`**:
    *   **Payload:** `{ winnerId?: string, winnerName?: string, bidsTied: boolean, yourNewCoinTotal: number, opponentNewLowCoinsStatus: boolean }`
        *   `winnerId` and `winnerName` if there's a winner.
        *   `yourNewCoinTotal` is the current player's coin total *after* their (now known to them) bid was subtracted and 2 coins awarded.
        *   `opponentNewLowCoinsStatus` is the updated boolean for opponent having few coins.
    *   **Action:**
        *   Sets `isTimerActive` to false.
        *   Updates `myCoins` to `yourNewCoinTotal`. Updates `opponentHasFewCoins` to `opponentNewLowCoinsStatus`.
        *   Sets `bidOutcome` (with `winnerId`, `winnerName`, `bidsTied`). The client knows its own bid from `currentBidAmount` when the timer ended.
        *   Sets `biddingStatusMessage` to display winner/tie status and current player's coin update.
        *   If `winnerId` matches current player's ID, set `canChooseAction` to true.
3.  **`opponentSelectedAction`**:
    *   **Payload:** `{ chosenAction: 'ask' | 'truth', choosingPlayerName: string }`
    *   **Action:** If current player is *not* the winner, update `biddingStatusMessage`.
4.  **`forceNavigate`**:
    *   **Payload:** `{ path: string }`
    *   **Action:** `navigate(data.path)`.

### Emitters (Outgoing to Server):

1.  **`submitFinalBid`**:
    *   **Payload:** `{ gameId: string, bidAmount: number }`
    *   **Action:** Sent by the client when its `timeLeft` reaches 0, sending the `currentBidAmount`.
2.  **`playerMadeChoice`**:
    *   **Payload:** `{ gameId: string, choice: 'ask' | 'truth' }`
    *   **Action:** Sent if player won the bid and clicked "Choose ASK" or "Choose TRUTH".

## 5. Core Logic Flow

1.  **Screen Initialization:**
    *   Server sends `biddingPhaseState`. Client populates UI, starts timer, enables +/- bid buttons.
2.  **Bidding Period:**
    *   Player uses +/- buttons to adjust `currentBidAmount`.
    *   Timer ticks down. When `timeLeft` is 0:
        *   Set `isTimerActive` to false (disables +/- buttons).
        *   Client emits `submitFinalBid` with the final `currentBidAmount`.
        *   `biddingStatusMessage` changes to "Time's up! Submitting your bid..."
3.  **Bid Resolution:**
    *   Server collects both bids (waits for `submitFinalBid` from both or handles server-side timeout).
    *   Server determines winner/tie, calculates new coin totals.
    *   Server emits `biddingResolved`.
    *   Client receives `biddingResolved`, updates state and UI.
4.  **Action Selection (if a winner):**
    *   If `canChooseAction` is true: "Ask" / "Truth" buttons are enabled.
    *   Winner clicks a choice. `playerMadeChoice` is emitted.
    *   If current player is not winner, they await `opponentSelectedAction` or a navigation event.
5.  **Transition:**
    *   Based on action choice (or tie), server may emit `forceNavigate` to move to the next game screen/phase, or it might send another `biddingPhaseState` if it's a new bidding round immediately.

## 6. Key Considerations / Edge Cases

*   **Player Disconnection:** Server needs to handle this gracefully. Client might show a "Opponent disconnected" message.
*   **Page Refresh:** Client should emit an event like `requestBiddingState` to get current data.
*   **Bid Adjustment Limits:** +/- buttons correctly disable at 0 and `myCoins`.
*   **Timer Synchronization:** Server is the ultimate source of truth for ending the round. Client's `submitFinalBid` is a response to its timer ending.
*   **Opponent Coin Status Updates:** `opponentHasFewCoins` must be accurately updated from server messages.

This provides a comprehensive plan for the `BiddingScreen`. 