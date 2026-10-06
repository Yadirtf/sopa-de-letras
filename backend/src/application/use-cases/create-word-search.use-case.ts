import { randomUUID } from "crypto";
import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { UnexpectedWordSearchError } from "../../domain/errors/generator.errors";
import { WordSearch } from "../../domain/entities/word-search.entity";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../domain/services/catalog-cache.service.interface";
import { WordSearchGeneratorService } from "../../domain/services/word-search-generator.service";
import { CreateWordSearchDto, MyWordSearchItemDto } from "../dtos/editor.dtos";

export class CreateWordSearchUseCase {
  constructor(
    private readonly wordSearchRepo: IWordSearchRepository,
    private readonly generatorService: WordSearchGeneratorService,
    private readonly catalogCache: ICatalogCacheService
  ) {}

  async execute(dto: CreateWordSearchDto, creatorId: string): Promise<Result<MyWordSearchItemDto, DomainError>> {
    try {
      const generated = this.generatorService.generate({
        words: dto.words,
        gridSize: dto.gridSize,
        difficulty: dto.difficulty,
      });

      const wordSearch = WordSearch.create({
        id: randomUUID(),
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        category: dto.category.trim().toUpperCase(),
        difficulty: dto.difficulty,
        language: "es",
        gridSize: dto.gridSize,
        wordCount: generated.placedWords.length,
        playCount: 0,
        isPublic: dto.isPublic ?? true,
        creatorId,
        grid: generated.grid,
        words: generated.placedWords as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.wordSearchRepo.save(wordSearch);

      try {
        await this.catalogCache.invalidate("cache:catalog:*");
      } catch {
        // Ignorar fallo en invalidación de caché
      }

      return ok({
        id: wordSearch.id,
        title: wordSearch.title,
        description: wordSearch.description,
        category: wordSearch.category,
        difficulty: wordSearch.difficulty,
        gridSize: wordSearch.gridSize,
        wordCount: wordSearch.wordCount,
        playCount: wordSearch.playCount,
        isPublic: wordSearch.isPublic,
        createdAt: wordSearch.createdAt.toISOString(),
      });
    } catch (err: any) {
      if (err instanceof DomainError) return fail(err);
      return fail(new UnexpectedWordSearchError(err?.message || "Error al crear la sopa de letras"));
    }
  }
}

