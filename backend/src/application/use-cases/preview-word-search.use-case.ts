import { Result, ok, fail } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { WordSearchGeneratorService } from "../../domain/services/word-search-generator.service";
import { PreviewWordSearchDto, PreviewWordSearchResponseDto } from "../dtos/editor.dtos";

export class PreviewWordSearchUseCase {
  constructor(private readonly generatorService: WordSearchGeneratorService) {}

  async execute(dto: PreviewWordSearchDto): Promise<Result<PreviewWordSearchResponseDto, DomainError>> {
    try {
      const generated = this.generatorService.generate({
        words: dto.words,
        gridSize: dto.gridSize,
        difficulty: dto.difficulty,
      });

      return ok({
        grid: generated.grid,
        placedWords: generated.placedWords,
        gridSize: generated.gridSize,
      });
    } catch (err: any) {
      if (err instanceof DomainError) {
        return fail(err);
      }
      return fail(new DomainError(err.message || "Error al previsualizar la sopa") as any);
    }
  }
}
