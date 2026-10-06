import { Result, ok } from "../common/result";
import { DomainError } from "../../domain/errors/auth.errors";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { MyWordSearchItemDto } from "../dtos/editor.dtos";

export class GetMyWordSearchesUseCase {
  constructor(private readonly wordSearchRepo: IWordSearchRepository) {}

  async execute(creatorId: string): Promise<Result<MyWordSearchItemDto[], DomainError>> {
    const list = await this.wordSearchRepo.findByCreatorId(creatorId);

    const dtos: MyWordSearchItemDto[] = list.map((ws) => ({
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
    }));

    return ok(dtos);
  }
}
