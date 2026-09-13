import { WordPlacement } from '../shared/types';

// Approximate Spanish letter frequencies
const LETTER_FREQUENCIES = [
  { letter: 'E', freq: 13.7 },
  { letter: 'A', freq: 12.5 },
  { letter: 'O', freq: 8.7 },
  { letter: 'S', freq: 7.9 },
  { letter: 'R', freq: 6.9 },
  { letter: 'N', freq: 6.7 },
  { letter: 'I', freq: 6.2 },
  { letter: 'D', freq: 5.9 },
  { letter: 'L', freq: 5.0 },
  { letter: 'C', freq: 4.7 },
  { letter: 'T', freq: 4.6 },
  { letter: 'U', freq: 3.9 },
  { letter: 'M', freq: 3.2 },
  { letter: 'P', freq: 2.5 },
  { letter: 'B', freq: 1.4 },
  { letter: 'G', freq: 1.0 },
  { letter: 'V', freq: 0.9 },
  { letter: 'Y', freq: 0.9 },
  { letter: 'Q', freq: 0.9 },
  { letter: 'H', freq: 0.7 },
  { letter: 'F', freq: 0.7 },
  { letter: 'Z', freq: 0.5 },
  { letter: 'J', freq: 0.4 },
  { letter: 'Ñ', freq: 0.3 },
  { letter: 'X', freq: 0.2 },
  { letter: 'W', freq: 0.01 },
  { letter: 'K', freq: 0.01 }
];

export function fillEmptyCells(grid: string[][], _placements: WordPlacement[]): string[][] {
  const newGrid = grid.map(row => [...row]);
  
  // Build a weighted array for fast random selection
  const weightedLetters: string[] = [];
  for (const { letter, freq } of LETTER_FREQUENCIES) {
    const count = Math.ceil(freq * 10); // scale up
    for (let i = 0; i < count; i++) {
      weightedLetters.push(letter);
    }
  }

  const getRandomLetter = () => weightedLetters[Math.floor(Math.random() * weightedLetters.length)];

  for (let r = 0; r < newGrid.length; r++) {
    for (let c = 0; c < newGrid[r].length; c++) {
      if (newGrid[r][c] === '') {
        newGrid[r][c] = getRandomLetter();
      }
    }
  }

  return newGrid;
}
