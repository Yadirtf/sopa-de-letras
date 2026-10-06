export interface CoordinatePair {
  start: [number, number];
  end: [number, number];
}

export class WordValidationHelper {
  public static isValidStraightLine(
    start: [number, number],
    end: [number, number],
    expectedLength: number
  ): boolean {
    const [r1, c1] = start;
    const [r2, c2] = end;

    const dr = r2 - r1;
    const dc = c2 - c1;

    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    // Vector must be horizontal, vertical or 45-degree diagonal
    const isHorizontal = absDr === 0 && absDc > 0;
    const isVertical = absDc === 0 && absDr > 0;
    const isDiagonal = absDr > 0 && absDr === absDc;

    if (!isHorizontal && !isVertical && !isDiagonal) {
      return false;
    }

    const cellSpan = Math.max(absDr, absDc) + 1;
    return cellSpan === expectedLength;
  }

  public static extractWordFromGrid(
    grid: string[][],
    start: [number, number],
    end: [number, number]
  ): string {
    const [r1, c1] = start;
    const [r2, c2] = end;

    const numRows = grid.length;
    const numCols = grid[0]?.length || 0;

    if (r1 < 0 || r1 >= numRows || c1 < 0 || c1 >= numCols ||
        r2 < 0 || r2 >= numRows || c2 < 0 || c2 >= numCols) {
      return '';
    }

    const stepR = Math.sign(r2 - r1);
    const stepC = Math.sign(c2 - c1);
    const length = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;

    let extracted = '';
    let currR = r1;
    let currC = c1;

    for (let i = 0; i < length; i++) {
      extracted += grid[currR][currC];
      currR += stepR;
      currC += stepC;
    }

    return extracted.toUpperCase();
  }

  public static calculateWordScore(wordLength: number, isFirstClaim: boolean): number {
    const baseScore = 100;
    const lengthBonus = wordLength * 15;
    const firstClaimBonus = isFirstClaim ? 50 : 0;
    return baseScore + lengthBonus + firstClaimBonus;
  }
}
