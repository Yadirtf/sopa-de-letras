import { PrismaClient } from "@prisma/client";
import { WordSearch } from "../../../domain/entities/word-search.entity";
import {
  IWordSearchRepository,
  CatalogFilterOptions,
  CatalogResult,
} from "../../../domain/repositories/word-search.repository.interface";

export class PrismaWordSearchRepository implements IWordSearchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCatalog(options: CatalogFilterOptions): Promise<CatalogResult> {
    const where: any = { isPublic: true };

    if (options.category && options.category.toLowerCase() !== 'todos') {
      where.category = { equals: options.category, mode: 'insensitive' };
    }
    if (options.difficulty) {
      where.difficulty = options.difficulty;
    }
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

    let nextCursor: string | null = null;
    const hasNext = rawItems.length > options.limit;
    const pageItems = hasNext ? rawItems.slice(0, options.limit) : rawItems;

    if (hasNext && pageItems.length > 0) {
      nextCursor = pageItems[pageItems.length - 1].id;
    }

    return {
      items: pageItems.map((raw) => this.mapToDomain(raw)),
      nextCursor,
      totalCount,
    };
  }

  async findById(id: string): Promise<WordSearch | null> {
    const raw = await this.prisma.wordSearch.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
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

  async count(): Promise<number> {
    return this.prisma.wordSearch.count({ where: { isPublic: true } });
  }

  private mapToDomain(raw: any): WordSearch {
    const wordsArray = Array.isArray(raw.words) ? raw.words : [];
    return WordSearch.create({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      difficulty: raw.difficulty,
      language: raw.language,
      gridSize: raw.gridSize,
      wordCount: wordsArray.length,
      playCount: raw.playCount,
      isPublic: raw.isPublic,
      creatorId: raw.creatorId,
      creatorName: raw.creator?.name,
      grid: raw.grid,
      words: raw.words,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
