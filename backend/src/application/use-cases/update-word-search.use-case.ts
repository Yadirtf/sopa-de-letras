import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { WordSearchNotFoundError } from "../../domain/errors/catalog.errors";
import { UnauthorizedWordSearchAccessError } from "../../domain/errors/generator.errors";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../domain/services/catalog-cache.service.interface";
import { UpdateWordSearchDto, MyWordSearchItemDto } from "../dtos/editor.dtos";

export class UpdateWordSearchUseCase {
  constructor(
    private readonly wordSearchRepo: IWordSearchRepository,
    private readonly catalogCache: ICatalogCacheService
  ) {}

  async execute(
    id: string,
    dto: UpdateWordSearchDto,
    userId: string
  ): Promise<Result<MyWordSearchItemDto, DomainError>> {
    const ws = await this.wordSearchRepo.findById(id);
    if (!ws) {
      return fail(new WordSearchNotFoundError(id));
    }

    if (!ws.isOwnedBy(userId)) {
      return fail(new UnauthorizedWordSearchAccessError());
    }

    ws.updateDetails(dto);
    await this.wordSearchRepo.update(ws);

    try {
      await this.catalogCache.invalidate("cache:catalog:*");
    } catch {
      // Ignorar fallo en cache
    }

    return ok({
      id: ws.id,
      title: ws.title,
      description: ws.description,
      category: ws.category,
      difficulty: ws.difficulty,
      gridSize: ws.gridSize,
      wordCount: ws.wordCount,
      playCount: ws.playCount,
      isPublic: ws.isPublic,
      createdAt: ws.createdAt.toISOString(),
    });
  }
}
