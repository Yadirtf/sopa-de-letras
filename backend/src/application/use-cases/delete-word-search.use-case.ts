import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { WordSearchNotFoundError } from "../../domain/errors/catalog.errors";
import {
  UnauthorizedWordSearchAccessError,
  WordSearchHasActiveRoomsError,
} from "../../domain/errors/generator.errors";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../domain/services/catalog-cache.service.interface";

export class DeleteWordSearchUseCase {
  constructor(
    private readonly wordSearchRepo: IWordSearchRepository,
    private readonly catalogCache: ICatalogCacheService
  ) {}

  async execute(id: string, userId: string): Promise<Result<{ message: string }, DomainError>> {
    const ws = await this.wordSearchRepo.findById(id);
    if (!ws) {
      return fail(new WordSearchNotFoundError(id));
    }

    if (!ws.isOwnedBy(userId)) {
      return fail(new UnauthorizedWordSearchAccessError());
    }

    const hasRooms = await this.wordSearchRepo.hasActiveRooms(id);
    if (hasRooms) {
      return fail(new WordSearchHasActiveRoomsError());
    }

    await this.wordSearchRepo.delete(id);

    try {
      await this.catalogCache.invalidate("cache:catalog:*");
    } catch {
      // Ignorar fallo en cache
    }

    return ok({ message: "Sopa de letras eliminada exitosamente" });
  }
}
