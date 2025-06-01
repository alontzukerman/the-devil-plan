import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartScreen from './screens/StartScreen';
import CardSelectionScreen from './screens/CardSelectionScreen';
import BiddingScreen from './screens/BiddingScreen';
import TruthGuessingScreen from './screens/TruthGuessingScreen';
import GameOverScreen from './screens/GameOverScreen';
import { QuestionSelectionScreen } from './screens/QuestionSelectionScreen';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/game/:gameId/select-cards" element={<CardSelectionScreen />} />
      <Route path="/game/:gameId/bidding" element={<BiddingScreen />} />
      <Route path="/game/:gameId/select-question" element={<QuestionSelectionScreen />} />
      <Route path="/game/:gameId/guess-truth" element={<TruthGuessingScreen />} />
      <Route path="/game/:gameId/game-over" element={<GameOverScreen />} />
    </Routes>
  );
}

export default App;
