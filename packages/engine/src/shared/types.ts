export enum Direction {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  DOWN = 'DOWN',
  UP = 'UP',
  DOWN_RIGHT = 'DOWN_RIGHT',
  DOWN_LEFT = 'DOWN_LEFT',
  UP_RIGHT = 'UP_RIGHT',
  UP_LEFT = 'UP_LEFT'
}

export interface DirectionVector {
  row: number;
  col: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleConfig {
  size: number;
  difficulty: Difficulty;
  allowReverse: boolean;
  allowDiagonal: boolean;
  allowHorizontal: boolean;
  allowVertical: boolean;
}

export interface WordPlacement {
  original: string;
  normalized: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  cells: Array<{row: number; col: number; letter: string}>;
}

export interface PuzzleDefinition {
  title: string;
  words: string[];
  grid: string[][];
  placements: WordPlacement[];
  config: PuzzleConfig;
  createdAt: number;
}

export interface CellSelection {
  row: number;
  col: number;
}

export interface WordValidationResult {
  valid: boolean;
  word?: string;
  placement?: WordPlacement;
}

export interface GameState {
  puzzleId: string;
  wordsFound: string[];
  wordsTotal: number;
  mistakes: number;
  startedAt: number;
  completedAt?: number;
  status: 'playing' | 'completed' | 'abandoned';
}

export interface GenerationResult {
  success: boolean;
  grid?: string[][];
  placements?: WordPlacement[];
  error?: string;
  attempts: number;
}
