import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { normalizeWord } from '../utils/wordNormalizer';
import { reconstructFoundCells } from '../utils/wordLocator';

interface Point {
  row: number;
  col: number;
}

interface GameState {
  puzzleId?: string;
  sessionId?: string;
  grid: string[][];
  words: string[];
  foundWords: string[];
  foundCells: Set<string>;
  startTime: number;
  isComplete: boolean;
  endTime?: number;
  isMultiplayer?: boolean;
}

function getStorageKey(puzzleId?: string, sessionId?: string): string {
  return `sopadeletras_progress_${puzzleId || 'p'}_${sessionId || 's'}`;
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    words: [],
    foundWords: [],
    foundCells: new Set(),
    startTime: 0,
    isComplete: false,
    isMultiplayer: false,
  });

  const initGame = (
    puzzleId: string, 
    sessionId: string, 
    grid: string[][], 
    words: string[], 
    isMultiplayer: boolean = false,
    initialFoundWords: string[] = [],
    initialFoundCells?: Set<string>
  ) => {
    let resolvedFoundWords: string[] = [...initialFoundWords];
    let resolvedFoundCells = new Set<string>(initialFoundCells || []);

    // Check LocalStorage for saved progress if initial is empty or partial
    const storageKey = getStorageKey(puzzleId, sessionId);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.foundWords)) {
          for (const w of parsed.foundWords) {
            if (!resolvedFoundWords.some(rw => normalizeWord(rw) === normalizeWord(w))) {
              resolvedFoundWords.push(w);
            }
          }
        }
        if (Array.isArray(parsed.foundCells)) {
          for (const c of parsed.foundCells) {
            resolvedFoundCells.add(c);
          }
        }
      }
    } catch (e) {
      console.error('Error reading saved game progress from localStorage', e);
    }

    // If we have found words but missing found cells, reconstruct them from grid
    if (resolvedFoundWords.length > 0 && resolvedFoundCells.size === 0 && grid && grid.length > 0) {
      resolvedFoundCells = reconstructFoundCells(grid, resolvedFoundWords);
    }

    const isComplete = resolvedFoundWords.length >= words.length && words.length > 0;

    setGameState({
      puzzleId,
      sessionId,
      grid,
      words,
      foundWords: resolvedFoundWords,
      foundCells: resolvedFoundCells,
      startTime: Date.now(),
      isComplete,
      isMultiplayer,
    });
  };

  const handleWordSelected = useCallback(async (cells: Point[]) => {
    if (gameState.isComplete || cells.length === 0) return;
    
    // Construct word from selected cells
    const rawSelected = cells.map(pt => gameState.grid[pt.row]?.[pt.col] || '').join('');
    const cleanSelected = normalizeWord(rawSelected);
    const cleanSelectedReverse = cleanSelected.split('').reverse().join('');
    
    // Match against puzzle words ignoring spaces, casing and accents
    const matchedWord = gameState.words.find(w => {
      const cleanW = normalizeWord(w);
      return cleanW === cleanSelected || cleanW === cleanSelectedReverse;
    });
    
    if (matchedWord) {
      const alreadyFound = gameState.foundWords.some(fw => normalizeWord(fw) === normalizeWord(matchedWord));
      
      if (!alreadyFound) {
        // Valid word found locally - update state immediately for responsive UX
        setGameState(prev => {
          const newFoundWords = [...prev.foundWords, matchedWord];
          const newFoundCells = new Set(prev.foundCells);
          cells.forEach(pt => newFoundCells.add(`${pt.row}-${pt.col}`));
          
          const isComplete = newFoundWords.length >= prev.words.length;
          
          // Persist progress to localStorage
          try {
            const storageKey = getStorageKey(prev.puzzleId, prev.sessionId);
            localStorage.setItem(storageKey, JSON.stringify({
              foundWords: newFoundWords,
              foundCells: Array.from(newFoundCells),
              isComplete
            }));
          } catch (e) {
            console.error('Error persisting game progress', e);
          }

          return {
            ...prev,
            foundWords: newFoundWords,
            foundCells: newFoundCells,
            isComplete,
            endTime: isComplete ? Date.now() : prev.endTime
          };
        });

        // Inform backend via REST in solo mode (in multiplayer, Socket.IO handles this)
        if (gameState.sessionId && !gameState.isMultiplayer) {
          try {
            const res = await api.post(`/game/sessions/${gameState.sessionId}/move`, { cells });
            if (res?.isComplete) {
              setGameState(prev => ({
                ...prev,
                isComplete: true,
                endTime: Date.now()
              }));
            }
          } catch (err) {
            console.error("Failed to report word found", err);
          }
        }
      }
    }
  }, [gameState]);

  return {
    ...gameState,
    initGame,
    handleWordSelected,
    setGameState
  };
}
