import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateWordSearchUseCase } from "../../../src/application/use-cases/update-word-search.use-case";
import { DeleteWordSearchUseCase } from "../../../src/application/use-cases/delete-word-search.use-case";
import { WordSearch } from "../../../src/domain/entities/word-search.entity";
import { IWordSearchRepository } from "../../../src/domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../../src/domain/services/catalog-cache.service.interface";

describe("UpdateWordSearchUseCase & DeleteWordSearchUseCase", () => {
  let mockRepo: IWordSearchRepository;
  let mockCache: ICatalogCacheService;
  let updateUseCase: UpdateWordSearchUseCase;
  let deleteUseCase: DeleteWordSearchUseCase;

  const sampleEntity = WordSearch.create({
    id: "ws-mine",
    title: "Mi Sopa Original",
    description: "Descripcion inicial",
    category: "CIENCIA",
    difficulty: "MEDIUM",
    language: "es",
    gridSize: 10,
    wordCount: 5,
    playCount: 1,
    isPublic: true,
    creatorId: "user-owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockRepo = {
      findCatalog: vi.fn(),
      findById: vi.fn().mockResolvedValue(sampleEntity),
      findByCreatorId: vi.fn(),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      hasActiveRooms: vi.fn().mockResolvedValue(false),
      count: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    updateUseCase = new UpdateWordSearchUseCase(mockRepo, mockCache);
    deleteUseCase = new DeleteWordSearchUseCase(mockRepo, mockCache);
  });

  it("debe permitir al autor actualizar los detalles de la sopa", async () => {
    const result = await updateUseCase.execute(
      "ws-mine",
      { title: "Mi Sopa Modificada", category: "ARTE" },
      "user-owner"
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value.title).toBe("Mi Sopa Modificada");
    expect(result.value.category).toBe("ARTE");
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    expect(mockCache.invalidate).toHaveBeenCalledWith("cache:catalog:*");
  });

  it("debe retornar HTTP 403 Forbidden si un usuario no autor intenta actualizar", async () => {
    const result = await updateUseCase.execute(
      "ws-mine",
      { title: "Intruso Hack" },
      "other-user"
    );

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(403);
  });

  it("debe permitir al autor eliminar su sopa si no tiene partidas activas", async () => {
    const result = await deleteUseCase.execute("ws-mine", "user-owner");

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith("ws-mine");
    expect(mockCache.invalidate).toHaveBeenCalledWith("cache:catalog:*");
  });

  it("debe retornar HTTP 409 Conflict si la sopa tiene partidas activas", async () => {
    vi.mocked(mockRepo.hasActiveRooms).mockResolvedValueOnce(true);

    const result = await deleteUseCase.execute("ws-mine", "user-owner");

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(409);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
