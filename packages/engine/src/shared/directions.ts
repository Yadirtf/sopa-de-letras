import { Direction, DirectionVector, PuzzleConfig } from './types';

const DIRECTION_MAP: Record<Direction, DirectionVector> = {
  [Direction.RIGHT]: { row: 0, col: 1 },
  [Direction.LEFT]: { row: 0, col: -1 },
  [Direction.DOWN]: { row: 1, col: 0 },
  [Direction.UP]: { row: -1, col: 0 },
  [Direction.DOWN_RIGHT]: { row: 1, col: 1 },
  [Direction.DOWN_LEFT]: { row: 1, col: -1 },
  [Direction.UP_RIGHT]: { row: -1, col: 1 },
  [Direction.UP_LEFT]: { row: -1, col: -1 }
};

const OPPOSITE_MAP: Record<Direction, Direction> = {
  [Direction.RIGHT]: Direction.LEFT,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.DOWN]: Direction.UP,
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN_RIGHT]: Direction.UP_LEFT,
  [Direction.DOWN_LEFT]: Direction.UP_RIGHT,
  [Direction.UP_RIGHT]: Direction.DOWN_LEFT,
  [Direction.UP_LEFT]: Direction.DOWN_RIGHT
};

export function getDirectionVector(direction: Direction): DirectionVector {
  return DIRECTION_MAP[direction];
}

export function getOppositeDirection(direction: Direction): Direction {
  return OPPOSITE_MAP[direction];
}

export function getDirectionsForConfig(config: PuzzleConfig): Direction[] {
  const directions: Direction[] = [];

  if (config.allowHorizontal) {
    directions.push(Direction.RIGHT);
    if (config.allowReverse) directions.push(Direction.LEFT);
  }

  if (config.allowVertical) {
    directions.push(Direction.DOWN);
    if (config.allowReverse) directions.push(Direction.UP);
  }

  if (config.allowDiagonal) {
    directions.push(Direction.DOWN_RIGHT);
    if (config.allowReverse) directions.push(Direction.UP_LEFT);
    
    // In many puzzles, we might also want DOWN_LEFT and UP_RIGHT
    directions.push(Direction.DOWN_LEFT);
    if (config.allowReverse) directions.push(Direction.UP_RIGHT);
  }

  return directions;
}
