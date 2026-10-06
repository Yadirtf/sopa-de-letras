import { PrismaClient } from "@prisma/client";
import { WordSearch } from "../../../domain/entities/word-search.entity";
import {
  IWordSearchRepository,
  CatalogFilterOptions,
  CatalogResult,
} from "../../../domain/repositories/word-search.repository.interface";
import { mapWordSearchToDomain } from "../mappers/word-search.mapper";

export class PrismaWordSearchRepository implements IWordSearchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCatalog(options: CatalogFilterOptions): Promise<CatalogResult> {
    const where: any = { isPublic: true };
    if (options.category && options.category.toLowerCase() !== 'todos') {
      where.category = { equals: options.category, mode: 'insensitive' };
    }
    if (options.difficulty) where.difficulty = options.difficulty;
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const queryArgs: any = {
      where,
      take: options.limit + 1,
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      include: { creator: { select: { name: true } } },
    };
    if (options.cursor) {
      queryArgs.cursor = { id: options.cursor };
      queryArgs.skip = 1;
    }

    const [rawItems, totalCount] = await Promise.all([
      this.prisma.wordSearch.findMany(queryArgs),
      this.prisma.wordSearch.count({ where }),
    ]);

    const hasNext = rawItems.length > options.limit;
    const pageItems = hasNext ? rawItems.slice(0, options.limit) : rawItems;
    const nextCursor = hasNext && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;

    return {
      items: pageItems.map(mapWordSearchToDomain),
      nextCursor,
      totalCount,
    };
  }

  async findById(id: string): Promise<WordSearch | null> {
    const raw = await this.prisma.wordSearch.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });
    return raw ? mapWordSearchToDomain(raw) : null;
  }

  async findByCreatorId(creatorId: string): Promise<WordSearch[]> {
    const list = await this.prisma.wordSearch.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { name: true } } },
    });
    return list.map(mapWordSearchToDomain);
  }

  async save(ws: WordSearch): Promise<void> {
    await this.prisma.wordSearch.create({
      data: {
        id: ws.id,
        title: ws.title,
        description: ws.description,
        category: ws.category,
        difficulty: ws.difficulty,
        language: ws.language,
        gridSize: ws.gridSize,
        grid: (ws.grid as any) ?? [],
        words: (ws.words as any) ?? [],
        creatorId: ws.creatorId,
        playCount: ws.playCount,
        isPublic: ws.isPublic,
        createdAt: ws.createdAt,
      },
    });
  }

  async update(ws: WordSearch): Promise<void> {
    await this.prisma.wordSearch.update({
      where: { id: ws.id },
      data: {
        title: ws.title,
        description: ws.description,
        category: ws.category,
        isPublic: ws.isPublic,
        updatedAt: ws.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wordSearch.delete({ where: { id } });
  }

  async hasActiveRooms(wordSearchId: string): Promise<boolean> {
    const active = await this.prisma.room.count({
      where: {
        wordSearchId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
    });
    return active > 0;
  }


  async count(): Promise<number> {
    return this.prisma.wordSearch.count({ where: { isPublic: true } });
  }
}
