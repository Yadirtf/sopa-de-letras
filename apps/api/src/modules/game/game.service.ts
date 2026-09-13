import { prisma } from '../../lib/prisma';
import { CellSelection, validateWordSelection, normalizeWord } from '@sopadeletras/engine';

export class GameService {
  static async createSession(puzzleId: string, playerId: string, roomId?: string) {
    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw new Error('Sopa de letras no encontrada');
    
    const words = puzzle.words as string[];
    
    return prisma.gameSession.create({
      data: {
        puzzleId,
        playerId,
        roomId,
        wordsTotal: words.length,
        startedAt: BigInt(Date.now())
      }
    });
  }

  static async getSession(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        player: { select: { id: true, nickname: true } }
      }
    });
  }

  static async processMove(sessionId: string, cells: CellSelection[]) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { puzzle: true }
    });
    
    if (!session) throw new Error('Sesión no encontrada');
    if (session.status !== 'playing') throw new Error('La partida ya ha finalizado');
    
    const placements = session.puzzle.placements as any[];
    let result = validateWordSelection(cells, placements);
    
    // Resilient fallback: if coordinates check fails, check letter sequence in grid against puzzle words
    if (!result.valid && session.puzzle.grid) {
      const grid = session.puzzle.grid as string[][];
      const selectedWord = cells.map(c => grid[c.row]?.[c.col] || '').join('');
      const normSelected = normalizeWord(selectedWord);
      const normSelectedRev = normSelected.split('').reverse().join('');
      
      const words = session.puzzle.words as string[];
      const matched = words.find(w => {
        const normW = normalizeWord(w);
        return normW === normSelected || normW === normSelectedRev;
      });
      if (matched) {
        result = { valid: true, word: matched };
      }
    }
    
    if (result.valid && result.word) {
      const wordsFound = session.wordsFound as string[];
      const alreadyFound = wordsFound.some(w => normalizeWord(w) === normalizeWord(result.word!));
      
      if (!alreadyFound) {
        wordsFound.push(result.word);
        
        const isComplete = wordsFound.length >= session.wordsTotal;
        const now = Date.now();
        
        await prisma.gameSession.update({
          where: { id: sessionId },
          data: {
            wordsFound,
            status: isComplete ? 'completed' : 'playing',
            completedAt: isComplete ? BigInt(now) : null,
            elapsedMs: isComplete ? BigInt(now) - session.startedAt : null
          }
        });
        
        return { valid: true, word: result.word, isComplete, alreadyFound: false };
      } else {
        return { valid: true, word: result.word, isComplete: wordsFound.length >= session.wordsTotal, alreadyFound: true };
      }
    } else {
      await prisma.gameSession.update({
        where: { id: sessionId },
        data: { mistakes: { increment: 1 } }
      });
      return { valid: false, message: 'Palabra incorrecta' };
    }
  }

  static async complete(sessionId: string) {
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('Sesión no encontrada');
    if (session.status === 'completed') return session;
    
    const now = Date.now();
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: BigInt(now),
        elapsedMs: BigInt(now) - session.startedAt
      }
    });
  }
}
