import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { InvalidCatalogQueryError } from "../../domain/errors/catalog.errors";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../domain/services/catalog-cache.service.interface";
import { CatalogQueryDto, CatalogResponseDto, WordSearchSummaryDto } from "../dtos/catalog.dtos";

export class GetCatalogListUseCase {
  constructor(
    private readonly wordSearchRepo: IWordSearchRepository,
    private readonly catalogCache: ICatalogCacheService
  ) {}

  async execute(query: CatalogQueryDto): Promise<Result<CatalogResponseDto, DomainError>> {
    const limit = Math.min(Math.max(query.limit ?? 12, 1), 50);
    if (query.search && query.search.length > 50) {
      return fail(new InvalidCatalogQueryError("El término de búsqueda no puede superar 50 caracteres"));
    }

    const cacheKey = `cache:catalog:${query.cursor || 'init'}:${limit}:${query.category || 'all'}:${query.difficulty || 'all'}:${query.search ? encodeURIComponent(query.search.trim()) : 'all'}`;

    // 1. Verificar cache en Redis (TTL 5m)
    try {
      const cached = await this.catalogCache.get(cacheKey);
      if (cached) {
        return ok(this.toResponseDto(cached.items, cached.nextCursor, cached.totalCount));
      }
    } catch {
      // Si falla Redis, continuar a base de datos de forma resiliente
    }

    // 2. Consultar repositorio
    const result = await this.wordSearchRepo.findCatalog({
      cursor: query.cursor,
      limit,
      category: query.category,
      difficulty: query.difficulty,
      search: query.search?.trim(),
    });

    // 3. Guardar en cache Redis
    try {
      await this.catalogCache.set(cacheKey, result, 300);
    } catch {
      // Ignorar fallo de escritura en cache
    }

    return ok(this.toResponseDto(result.items, result.nextCursor, result.totalCount));
  }

  private toResponseDto(
    items: import("../../domain/entities/word-search.entity").WordSearch[],
    nextCursor: string | null,
    totalCount: number
  ): CatalogResponseDto {
    const dtos: WordSearchSummaryDto[] = items.map((ws) => ({
      id: ws.id,
      title: ws.title,
      description: ws.description,
      category: ws.category,
      difficulty: ws.difficulty,
      language: ws.language,
      gridSize: ws.gridSize,
      wordCount: ws.wordCount,
      playCount: ws.playCount,
      creatorId: ws.creatorId,
      creatorName: ws.creatorName || 'WordHive Community',
      createdAt: ws.createdAt.toISOString(),
    }));

    return {
      items: dtos,
      nextCursor,
      totalCount,
      hasMore: nextCursor !== null,
    };
  }
}
