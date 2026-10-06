import {
  DirectionVector,
  PlacedWord,
  GeneratorOptions,
  GeneratedResult,
  SPANISH_LETTER_DISTRIBUTION,
} from "./word-search-generator.types";
import {
  WordSearchGenerationFailedError,
  InvalidWordListError,
} from "../errors/generator.errors";
import { sanitizeWordsList } from "./word-search-sanitizer";

export class WordSearchGeneratorService {
  private static readonly DIRECTIONS: Record<string, DirectionVector[]> = {
    EASY: [
      { type: 'RIGHT', dr: 0, dc: 1 },
      { type: 'DOWN', dr: 1, dc: 0 },
    ],
    MEDIUM: [
      { type: 'RIGHT', dr: 0, dc: 1 },
      { type: 'DOWN', dr: 1, dc: 0 },
      { type: 'DOWN_RIGHT', dr: 1, dc: 1 },
      { type: 'UP_RIGHT', dr: -1, dc: 1 },
    ],
    HARD: [
      { type: 'RIGHT', dr: 0, dc: 1 },
      { type: 'DOWN', dr: 1, dc: 0 },
      { type: 'DOWN_RIGHT', dr: 1, dc: 1 },
      { type: 'UP_RIGHT', dr: -1, dc: 1 },
      { type: 'LEFT', dr: 0, dc: -1 },
      { type: 'UP', dr: -1, dc: 0 },
      { type: 'UP_LEFT', dr: -1, dc: -1 },
      { type: 'DOWN_LEFT', dr: 1, dc: -1 },
    ],
  };

  public generate(options: GeneratorOptions): GeneratedResult {
    const { gridSize, difficulty, maxRetries = 100 } = options;
    const words = this.validateAndNormalizeWords(options.words, gridSize);
    const directions = WordSearchGeneratorService.DIRECTIONS[difficulty] || WordSearchGeneratorService.DIRECTIONS.MEDIUM;

    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => null)
      );
      const placedWords: PlacedWord[] = [];
      let success = true;

      for (const word of sortedWords) {
        const validPositions = this.findValidPositions(word, grid, gridSize, directions);
        if (validPositions.length === 0) {
          success = false;
          break;
        }

        const chosen = validPositions[Math.floor(Math.random() * validPositions.length)];
        this.placeWord(word, grid, chosen);
        placedWords.push(chosen);
      }

      if (success) {
        const finalGrid = this.fillResidualCells(grid);
        return { grid: finalGrid, placedWords, gridSize };
      }
    }

    throw new WordSearchGenerationFailedError();
  }

  private validateAndNormalizeWords(rawWords: string[], gridSize: number): string[] {
    const sanitized = sanitizeWordsList(rawWords);
    if (sanitized.length < 5 || sanitized.length > 20) {
      throw new InvalidWordListError("Debes ingresar entre 5 y 20 palabras válidas (de 3 a 15 letras)");
    }
    for (const word of sanitized) {
      if (word.length > gridSize) {
        throw new InvalidWordListError(`La palabra '${word}' es más larga que la cuadrícula (${gridSize}).`);
      }
    }
    return sanitized;
  }

  private findValidPositions(
    word: string,
    grid: (string | null)[][],
    size: number,
    directions: DirectionVector[]
  ): PlacedWord[] {
    const valid: PlacedWord[] = [];
    const len = word.length;

    for (const dir of directions) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const endR = r + dir.dr * (len - 1);
          const endC = c + dir.dc * (len - 1);

          if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

          let canPlace = true;
          for (let i = 0; i < len; i++) {
            const curR = r + dir.dr * i;
            const curC = c + dir.dc * i;
            const existing = grid[curR][curC];
            if (existing !== null && existing !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            valid.push({
              word,
              startRow: r,
              startCol: c,
              endRow: endR,
              endCol: endC,
              direction: dir.type,
            });
          }
        }
      }
    }
    return valid;
  }

  private placeWord(word: string, grid: (string | null)[][], placed: PlacedWord): void {
    const dir = WordSearchGeneratorService.DIRECTIONS.HARD.find((d) => d.type === placed.direction)!;
    for (let i = 0; i < word.length; i++) {
      grid[placed.startRow + dir.dr * i][placed.startCol + dir.dc * i] = word[i];
    }
  }

  private fillResidualCells(grid: (string | null)[][]): string[][] {
    const dist = SPANISH_LETTER_DISTRIBUTION;
    return grid.map((row) =>
      row.map((cell) => cell ?? dist[Math.floor(Math.random() * dist.length)])
    );
  }
}
