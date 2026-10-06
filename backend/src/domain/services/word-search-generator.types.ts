export type DirectionType =
  | 'RIGHT'
  | 'DOWN'
  | 'DOWN_RIGHT'
  | 'UP_RIGHT'
  | 'LEFT'
  | 'UP'
  | 'UP_LEFT'
  | 'DOWN_LEFT';

export interface DirectionVector {
  type: DirectionType;
  dr: number;
  dc: number;
}

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: DirectionType;
}

export interface GeneratorOptions {
  words: string[];
  gridSize: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  maxRetries?: number;
}

export interface GeneratedResult {
  grid: string[][];
  placedWords: PlacedWord[];
  gridSize: number;
}

// Distribución estadística de letras en español para relleno residual natural
export const SPANISH_LETTER_DISTRIBUTION = [
  ...'AAAAAAAAAAAA'.split(''), // 12
  ...'EEEEEEEEEEEE'.split(''), // 12
  ...'OOOOOOOOO'.split(''),    // 9
  ...'SSSSSSSS'.split(''),     // 8
  ...'NNNNNNN'.split(''),      // 7
  ...'RRRRRRR'.split(''),      // 7
  ...'IIIIII'.split(''),       // 6
  ...'DDDDDD'.split(''),       // 6
  ...'LLLLL'.split(''),        // 5
  ...'CCCCC'.split(''),        // 5
  ...'TTTTT'.split(''),        // 5
  ...'UUUU'.split(''),         // 4
  ...'MMM'.split(''),          // 3
  ...'PPP'.split(''),          // 3
  ...'BB'.split(''),           // 2
  ...'GG'.split(''),           // 2
  ...'VV'.split(''),           // 2
  ...'YY'.split(''),           // 2
  ...'QQ'.split(''),           // 2
  ...'H'.split(''),            // 1
  ...'F'.split(''),            // 1
  ...'Z'.split(''),            // 1
  ...'J'.split(''),            // 1
  ...'X'.split(''),            // 1
];
