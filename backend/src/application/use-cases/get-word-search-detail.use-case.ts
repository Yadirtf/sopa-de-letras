import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { WordSearchNotFoundError } from "../../domain/errors/catalog.errors";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { WordSearchDetailDto } from "../dtos/catalog.dtos";

export class GetWordSearchDetailUseCase {
  constructor(private readonly wordSearchRepo: IWordSearchRepository) {}

  async execute(id: string): Promise<Result<WordSearchDetailDto, DomainError>> {
    if (!id || id.trim().length === 0) {
      return fail(new WordSearchNotFoundError(id));
    }

    const wordSearch = await this.wordSearchRepo.findById(id);
    if (!wordSearch) {
      return fail(new WordSearchNotFoundError(id));
    }

    // Anti-Spoilers: Generar matriz decorativa segura para la vista previa
    const previewGrid = this.createSpoilerFreePreviewGrid(wordSearch.gridSize, wordSearch.grid);

    const wordsList = Array.isArray(wordSearch.words)
      ? wordSearch.words.map((w: any) => (typeof w === 'string' ? w : w?.word || String(w)))
      : [];

    const detailDto: WordSearchDetailDto = {
      id: wordSearch.id,
      title: wordSearch.title,
      description: wordSearch.description,
      category: wordSearch.category,
      difficulty: wordSearch.difficulty,
      language: wordSearch.language,
      gridSize: wordSearch.gridSize,
      wordCount: wordSearch.wordCount,
      words: wordsList,
      playCount: wordSearch.playCount,
      creatorId: wordSearch.creatorId,
      creatorName: wordSearch.creatorName || 'WordHive Community',
      previewGrid,
      createdAt: wordSearch.createdAt.toISOString(),
    };

    return ok(detailDto);
  }

  // Crea una cuadrícula preliminar segura sin revelar soluciones
  private createSpoilerFreePreviewGrid(size: number, realGrid?: string[][] | null): string[][] {
    const safeSize = Math.min(Math.max(size, 8), 20);
    const alphabet = "ABCDEFGHILMNOPRSTUVZ";

    if (realGrid && Array.isArray(realGrid) && realGrid.length === safeSize) {
      // Reemplaza aleatoriamente el 40% de celdas para prevenir ingeniería inversa de pantalla
      return realGrid.map((row) =>
        row.map((char) =>
          Math.random() > 0.6
            ? alphabet[Math.floor(Math.random() * alphabet.length)]
            : char
        )
      );
    }

    // Cuadrícula sintética determinista
    return Array.from({ length: safeSize }, () =>
      Array.from({ length: safeSize }, () =>
        alphabet[Math.floor(Math.random() * alphabet.length)]
      )
    );
  }
}
