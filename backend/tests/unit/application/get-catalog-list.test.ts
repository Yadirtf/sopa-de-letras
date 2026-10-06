import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetCatalogListUseCase } from "../../../src/application/use-cases/get-catalog-list.use-case";
import { WordSearch } from "../../../src/domain/entities/word-search.entity";
import { IWordSearchRepository } from "../../../src/domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../../src/domain/services/catalog-cache.service.interface";

describe("GetCatalogListUseCase", () => {
  let mockRepo: IWordSearchRepository;
  let mockCache: ICatalogCacheService;
  let useCase: GetCatalogListUseCase;

  const mockEntity = WordSearch.create({
    id: "ws-1",
    title: "Insectos",
    description: "Palabras sobre abejas y avispas",
    category: "NATURALEZA",
    difficulty: "EASY",
    language: "es",
    gridSize: 10,
    wordCount: 5,
    playCount: 42,
    isPublic: true,
    creatorId: "user-99",
    creatorName: "BeeMaster",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  });

  beforeEach(() => {
    mockRepo = {
      findCatalog: vi.fn().mockResolvedValue({
        items: [mockEntity],
        nextCursor: "next-cursor-token",
        totalCount: 1,
      }),
      findById: vi.fn(),
      save: vi.fn(),
      count: vi.fn(),
    };

    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new GetCatalogListUseCase(mockRepo, mockCache);
  });

  it("debe retornar catálogo desde la base de datos y almacenar en caché si cache miss", () => {
    return useCase.execute({ limit: 10 }).then((result) => {
      expect(result.isSuccess).toBe(true);
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].title).toBe("Insectos");
      expect(result.value.items[0].creatorName).toBe("BeeMaster");
      expect(result.value.hasMore).toBe(true);
      expect(result.value.nextCursor).toBe("next-cursor-token");
      expect(mockRepo.findCatalog).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledTimes(1);
    });
  });

  it("debe retornar datos desde la caché si está disponible", () => {
    vi.mocked(mockCache.get).mockResolvedValueOnce({
      items: [mockEntity],
      nextCursor: null,
      totalCount: 1,
    });

    return useCase.execute({ limit: 10 }).then((result) => {
      expect(result.isSuccess).toBe(true);
      expect(result.value.items).toHaveLength(1);
      expect(result.value.hasMore).toBe(false);
      expect(mockRepo.findCatalog).not.toHaveBeenCalled();
    });
  });

  it("debe fallar si el término de búsqueda supera 50 caracteres", () => {
    return useCase
      .execute({ search: "a".repeat(51) })
      .then((result) => {
        expect(result.isFailure).toBe(true);
        expect(result.error.statusCode).toBe(400);
      });
  });
});
