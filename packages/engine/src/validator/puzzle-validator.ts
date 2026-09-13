import { CellSelection, WordPlacement, WordValidationResult } from '../shared/types';

export function validateWordSelection(cells: CellSelection[], placements: WordPlacement[]): WordValidationResult {
  if (cells.length < 2) {
    return { valid: false };
  }

  // To match a placement, the selected cells must be exactly the cells of the placement (in order or reverse order)
  for (const placement of placements) {
    if (placement.cells.length !== cells.length) continue;

    // Check forward match
    let forwardMatch = true;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].row !== placement.cells[i].row || cells[i].col !== placement.cells[i].col) {
        forwardMatch = false;
        break;
      }
    }

    // Check reverse match
    let reverseMatch = true;
    for (let i = 0; i < cells.length; i++) {
      const revIdx = cells.length - 1 - i;
      if (cells[i].row !== placement.cells[revIdx].row || cells[i].col !== placement.cells[revIdx].col) {
        reverseMatch = false;
        break;
      }
    }

    if (forwardMatch || reverseMatch) {
      return {
        valid: true,
        word: placement.original || placement.normalized,
        placement
      };
    }
  }

  return { valid: false };
}

export function validatePuzzle(grid: string[][], placements: WordPlacement[]): { valid: boolean, errors: string[] } {
  const errors: string[] = [];

  for (const placement of placements) {
    for (const cell of placement.cells) {
      if (grid[cell.row] === undefined || grid[cell.row][cell.col] === undefined) {
        errors.push(`Celda fuera de límites: [${cell.row}, ${cell.col}] para la palabra ${placement.normalized}`);
      } else if (grid[cell.row][cell.col] !== cell.letter) {
        errors.push(`Letra incorrecta en [${cell.row}, ${cell.col}] para la palabra ${placement.normalized}. Esperada: ${cell.letter}, Encontrada: ${grid[cell.row][cell.col]}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function isPuzzleComplete(wordsFound: string[], totalWords: number): boolean {
  // Assuming wordsFound is a deduplicated list of correctly found words
  return wordsFound.length === totalWords;
}
