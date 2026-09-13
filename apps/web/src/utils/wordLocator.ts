import { normalizeWord } from './wordNormalizer';

/**
 * Scans a 2D grid to locate cell coordinates for an array of words.
 * Handles normalized accents and case matching.
 */
export function reconstructFoundCells(grid: string[][], words: string[]): Set<string> {
  const foundCells = new Set<string>();
  if (!grid || grid.length === 0 || !words || words.length === 0) {
    return foundCells;
  }

  const rows = grid.length;
  const cols = grid[0].length;

  const directions = [
    [0, 1],   // right
    [0, -1],  // left
    [1, 0],   // down
    [-1, 0],  // up
    [1, 1],   // down-right
    [1, -1],  // down-left
    [-1, 1],  // up-right
    [-1, -1]  // up-left
  ];

  for (const rawWord of words) {
    const cleanWord = normalizeWord(rawWord);
    if (!cleanWord) continue;
    const len = cleanWord.length;
    let wordFound = false;

    for (let r = 0; r < rows && !wordFound; r++) {
      for (let c = 0; c < cols && !wordFound; c++) {
        for (const [dr, dc] of directions) {
          const endR = r + (len - 1) * dr;
          const endC = c + (len - 1) * dc;

          if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) {
            continue;
          }

          let matches = true;
          for (let i = 0; i < len; i++) {
            const letter = grid[r + i * dr]?.[c + i * dc] || '';
            if (normalizeWord(letter) !== cleanWord[i]) {
              matches = false;
              break;
            }
          }

          if (matches) {
            for (let i = 0; i < len; i++) {
              foundCells.add(`${r + i * dr}-${c + i * dc}`);
            }
            wordFound = true;
            break;
          }
        }
      }
    }
  }

  return foundCells;
}
