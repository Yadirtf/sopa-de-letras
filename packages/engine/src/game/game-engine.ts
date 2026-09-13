import { GameState } from '../shared/types';
import { isPuzzleComplete } from '../validator/puzzle-validator';

export function createGameState(puzzleId: string, totalWords: number): GameState {
  return {
    puzzleId,
    wordsFound: [],
    wordsTotal: totalWords,
    mistakes: 0,
    startedAt: Date.now(),
    status: 'playing'
  };
}

export function processWordFound(state: GameState, word: string): GameState {
  if (state.status !== 'playing' || state.wordsFound.includes(word)) {
    return state;
  }

  const newWordsFound = [...state.wordsFound, word];
  
  if (isPuzzleComplete(newWordsFound, state.wordsTotal)) {
    return {
      ...state,
      wordsFound: newWordsFound,
      status: 'completed',
      completedAt: Date.now()
    };
  }

  return {
    ...state,
    wordsFound: newWordsFound
  };
}

export function processInvalidAttempt(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  return {
    ...state,
    mistakes: state.mistakes + 1
  };
}

export function completeGame(state: GameState): GameState {
  if (state.status === 'completed') {
    return state;
  }

  return {
    ...state,
    status: 'completed',
    completedAt: Date.now()
  };
}

export function abandonGame(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  return {
    ...state,
    status: 'abandoned',
    completedAt: Date.now()
  };
}

export function calculateElapsedMs(state: GameState): number {
  if (state.completedAt) {
    return state.completedAt - state.startedAt;
  }
  return Date.now() - state.startedAt;
}

export function getProgress(state: GameState): { found: number, total: number, remaining: number, percentage: number } {
  const found = state.wordsFound.length;
  const total = state.wordsTotal;
  const remaining = Math.max(0, total - found);
  const percentage = total === 0 ? 0 : Math.round((found / total) * 100);

  return {
    found,
    total,
    remaining,
    percentage
  };
}
