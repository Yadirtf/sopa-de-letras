import { prisma } from '../../lib/prisma';
import { generatePuzzle, sanitizeWordList, PuzzleConfig } from '@sopadeletras/engine';
import { nanoid } from 'nanoid';

export class PuzzleService {
  static async create(userId: string, data: { title: string, words: string[], config: PuzzleConfig, status?: string }) {
    const { valid } = sanitizeWordList(data.words);
    if (valid.length === 0) {
      throw new Error('No hay palabras válidas para generar la sopa de letras.');
    }

    const generationResult = generatePuzzle(valid, data.config);
    if (!generationResult.success || !generationResult.grid || !generationResult.placements) {
      throw new Error(generationResult.error || 'Error al generar la sopa de letras.');
    }

    const code = nanoid(8);
    const status = data.status === 'published' ? 'published' : 'draft';
    const visibility = status === 'published' ? 'public' : 'private';

    const puzzle = await prisma.puzzle.create({
      data: {
        code,
        title: data.title,
        creatorId: userId,
        words: valid,
        grid: generationResult.grid,
        placements: generationResult.placements as any,
        config: data.config as any,
        status,
        visibility,
      },
    });

    return puzzle;
  }

  static async getByCode(code: string) {
    const trimmed = code.trim();
    const puzzle = await prisma.puzzle.findFirst({
      where: {
        OR: [
          { code: trimmed },
          { code: { equals: trimmed, mode: 'insensitive' } },
          { id: trimmed }
        ]
      },
      include: { creator: { select: { nickname: true } } }
    });

    if (!puzzle) return null;

    // Remove placements before returning to client
    const { placements, ...safePuzzle } = puzzle;
    return safePuzzle;
  }

  static async getByCodeWithSolution(code: string) {
    return prisma.puzzle.findUnique({
      where: { code }
    });
  }

  static async getPublicPuzzles(options: { page?: number; limit?: number; search?: string; difficulty?: string } = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 6));
    const skip = (page - 1) * limit;

    const andConditions: any[] = [{ status: 'published' }];

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { creator: { nickname: { contains: q, mode: 'insensitive' } } }
        ]
      });
    }

    if (options.difficulty && options.difficulty !== 'all') {
      const diff = options.difficulty.toLowerCase();
      const variants = diff === 'easy' ? ['easy', 'fácil', 'Facil', 'Easy'] :
                       diff === 'medium' ? ['medium', 'media', 'Media', 'Medium'] :
                       ['hard', 'difícil', 'Dificil', 'Hard'];
      andConditions.push({
        OR: variants.map(v => ({
          config: {
            path: ['difficulty'],
            equals: v
          }
        }))
      });
    }

    const where = andConditions.length > 1 ? { AND: andConditions } : andConditions[0];

    const [total, puzzles] = await Promise.all([
      prisma.puzzle.count({ where }),
      prisma.puzzle.findMany({
        where,
        select: {
          id: true,
          code: true,
          title: true,
          words: true,
          config: true,
          status: true,
          createdAt: true,
          creator: {
            select: { nickname: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      items: puzzles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + puzzles.length < total
    };
  }

  static async getMyPuzzles(userId: string, options: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 6));
    const skip = (page - 1) * limit;

    const andConditions: any[] = [{ creatorId: userId }];

    if (options.status && options.status !== 'all') {
      andConditions.push({ status: options.status });
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } }
        ]
      });
    }

    const where = andConditions.length > 1 ? { AND: andConditions } : andConditions[0];

    const [total, puzzles] = await Promise.all([
      prisma.puzzle.count({ where }),
      prisma.puzzle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const safePuzzles = puzzles.map(p => {
      const { placements, ...safe } = p;
      return safe;
    });

    return {
      items: safePuzzles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + safePuzzles.length < total
    };
  }

  static async publish(puzzleId: string, userId: string) {
    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw new Error('Sopa de letras no encontrada.');
    if (puzzle.creatorId !== userId) throw new Error('No tienes permiso para publicar esta sopa de letras.');

    return prisma.puzzle.update({
      where: { id: puzzleId },
      data: {
        status: 'published',
        visibility: 'public'
      }
    });
  }

  static async unpublish(puzzleId: string, userId: string) {
    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw new Error('Sopa de letras no encontrada.');
    if (puzzle.creatorId !== userId) throw new Error('No tienes permiso para modificar esta sopa de letras.');

    return prisma.puzzle.update({
      where: { id: puzzleId },
      data: {
        status: 'draft',
        visibility: 'private'
      }
    });
  }

  static async setStatus(puzzleId: string, userId: string, status: 'draft' | 'published') {
    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw new Error('Sopa de letras no encontrada.');
    if (puzzle.creatorId !== userId) throw new Error('No tienes permiso para modificar esta sopa de letras.');

    return prisma.puzzle.update({
      where: { id: puzzleId },
      data: {
        status,
        visibility: status === 'published' ? 'public' : 'private'
      }
    });
  }

  static async getLeaderboard(puzzleCode: string, limit = 10) {
    const puzzle = await prisma.puzzle.findUnique({ where: { code: puzzleCode } });
    if (!puzzle) throw new Error('Sopa de letras no encontrada.');

    const sessions = await prisma.gameSession.findMany({
      where: {
        puzzleId: puzzle.id,
        status: 'completed',
        elapsedMs: { not: null }
      },
      include: {
        player: { select: { nickname: true } }
      },
      orderBy: { elapsedMs: 'asc' },
      take: limit
    });

    return sessions.map(s => ({
      id: s.id,
      nickname: s.player.nickname,
      elapsedMs: Number(s.elapsedMs),
      completedAt: s.completedAt ? new Date(Number(s.completedAt)).toISOString() : new Date().toISOString()
    }));
  }

  static async getByIdForEdit(puzzleIdOrCode: string, userId: string) {
    const puzzle = await prisma.puzzle.findFirst({
      where: {
        OR: [
          { id: puzzleIdOrCode },
          { code: puzzleIdOrCode }
        ]
      }
    });

    if (!puzzle) throw new Error('Sopa de letras no encontrada.');
    if (puzzle.creatorId !== userId) throw new Error('No tienes permiso para editar esta sopa de letras.');

    return puzzle;
  }

  static async update(puzzleIdOrCode: string, userId: string, data: { title: string, words: string[], config: PuzzleConfig, status?: string }) {
    const existing = await prisma.puzzle.findFirst({
      where: {
        OR: [
          { id: puzzleIdOrCode },
          { code: puzzleIdOrCode }
        ]
      }
    });
    if (!existing) throw new Error('Sopa de letras no encontrada.');
    if (existing.creatorId !== userId) throw new Error('No tienes permiso para editar esta sopa de letras.');

    const { valid } = sanitizeWordList(data.words);
    if (valid.length === 0) {
      throw new Error('No hay palabras válidas para generar la sopa de letras.');
    }

    const generationResult = generatePuzzle(valid, data.config);
    if (!generationResult.success || !generationResult.grid || !generationResult.placements) {
      throw new Error(generationResult.error || 'Error al regenerar la sopa de letras.');
    }

    const dataToUpdate: any = {
      title: data.title,
      words: valid,
      grid: generationResult.grid,
      placements: generationResult.placements as any,
      config: data.config as any,
      updatedAt: new Date(),
    };

    if (data.status) {
      dataToUpdate.status = data.status;
      dataToUpdate.visibility = data.status === 'published' ? 'public' : 'private';
    }

    const updated = await prisma.puzzle.update({
      where: { id: existing.id },
      data: dataToUpdate
    });

    return updated;
  }

  static async delete(puzzleIdOrCode: string, userId: string) {
    const existing = await prisma.puzzle.findFirst({
      where: {
        OR: [
          { id: puzzleIdOrCode },
          { code: puzzleIdOrCode }
        ]
      }
    });
    if (!existing) throw new Error('Sopa de letras no encontrada.');
    if (existing.creatorId !== userId) throw new Error('No tienes permiso para eliminar esta sopa de letras.');

    // Delete associated game sessions and rooms in a transaction to preserve FK integrity
    await prisma.$transaction([
      prisma.gameSession.deleteMany({ where: { puzzleId: existing.id } }),
      prisma.room.deleteMany({ where: { puzzleId: existing.id } }),
      prisma.puzzle.delete({ where: { id: existing.id } })
    ]);

    return { success: true, message: 'Sopa de letras eliminada correctamente.' };
  }
}
