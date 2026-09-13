import { GenerationResult, PuzzleConfig, WordPlacement } from '../shared/types';
import { getDirectionsForConfig, getDirectionVector } from '../shared/directions';
import { normalizeWord } from '../shared/normalizer';
import { fillEmptyCells } from './filler-engine';

interface Position {
  row: number;
  col: number;
  direction: any;
}

export function generatePuzzle(words: string[], config: PuzzleConfig): GenerationResult {
  const maxAttempts = 100;
  
  if (!words || words.length === 0) {
    return { success: false, error: 'Lista de palabras vacía', attempts: 0 };
  }

  const normalizedWords = words.map(w => ({
    original: w,
    normalized: normalizeWord(w)
  })).filter(w => w.normalized.length > 0);
  
  if (normalizedWords.length === 0) {
    return { success: false, error: 'Ninguna palabra válida', attempts: 0 };
  }

  const longestWordLength = Math.max(...normalizedWords.map(w => w.normalized.length));
  if (longestWordLength > config.size) {
    return { success: false, error: 'La cuadrícula es muy pequeña para las palabras dadas', attempts: 0 };
  }

  // Sort longest first
  normalizedWords.sort((a, b) => b.normalized.length - a.normalized.length);

  const allowedDirections = getDirectionsForConfig(config);
  if (allowedDirections.length === 0) {
    return { success: false, error: 'Configuración sin direcciones permitidas', attempts: 0 };
  }

  let attempts = 0;
  
  const generatePositions = (wordLength: number, size: number, dirs: any[]): Position[] => {
    const positions: Position[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const dir of dirs) {
          const vec = getDirectionVector(dir);
          const endRow = r + vec.row * (wordLength - 1);
          const endCol = c + vec.col * (wordLength - 1);
          
          if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size) {
            positions.push({ row: r, col: c, direction: dir });
          }
        }
      }
    }
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions;
  };

  const backtrack = (
    wordIndex: number, 
    currentGrid: string[][], 
    currentPlacements: WordPlacement[]
  ): boolean => {
    attempts++;
    if (attempts > maxAttempts) return false;
    
    if (wordIndex === normalizedWords.length) {
      return true; // All words placed
    }

    const wordInfo = normalizedWords[wordIndex];
    const positions = generatePositions(wordInfo.normalized.length, config.size, allowedDirections);

    for (const pos of positions) {
      const vec = getDirectionVector(pos.direction);
      let canPlace = true;
      const lettersToPlace: Array<{r: number, c: number, char: string}> = [];
      const cells: Array<{row: number, col: number, letter: string}> = [];

      for (let i = 0; i < wordInfo.normalized.length; i++) {
        const r = pos.row + vec.row * i;
        const c = pos.col + vec.col * i;
        const char = wordInfo.normalized[i];
        
        if (currentGrid[r][c] !== '' && currentGrid[r][c] !== char) {
          canPlace = false;
          break;
        }
        
        lettersToPlace.push({r, c, char});
        cells.push({row: r, col: c, letter: char});
      }

      if (canPlace) {
        // Apply placement
        for (const l of lettersToPlace) {
          currentGrid[l.r][l.c] = l.char;
        }
        
        const placement: WordPlacement = {
          original: wordInfo.original,
          normalized: wordInfo.normalized,
          direction: pos.direction,
          startRow: pos.row,
          startCol: pos.col,
          endRow: pos.row + vec.row * (wordInfo.normalized.length - 1),
          endCol: pos.col + vec.col * (wordInfo.normalized.length - 1),
          cells
        };
        
        currentPlacements.push(placement);

        if (backtrack(wordIndex + 1, currentGrid, currentPlacements)) {
          return true;
        }

        // Revert placement if not successful (backtrack)
        currentPlacements.pop();
        // Restore grid: only clear cells that aren't used by other current placements
        for (const l of lettersToPlace) {
          let cellInUse = false;
          for (const p of currentPlacements) {
            if (p.cells.some(c => c.row === l.r && c.col === l.c)) {
              cellInUse = true;
              break;
            }
          }
          if (!cellInUse) {
            currentGrid[l.r][l.c] = '';
          }
        }
      }
    }

    return false;
  };

  const grid: string[][] = Array(config.size).fill(null).map(() => Array(config.size).fill(''));
  const placements: WordPlacement[] = [];

  const success = backtrack(0, grid, placements);

  if (success) {
    const filledGrid = fillEmptyCells(grid, placements);
    return { success: true, grid: filledGrid, placements, attempts };
  } else {
    return { success: false, error: 'No se pudieron colocar todas las palabras (tiempo agotado o sin espacio)', attempts };
  }
}
