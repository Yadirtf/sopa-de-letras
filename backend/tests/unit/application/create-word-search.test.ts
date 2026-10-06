import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateWordSearchUseCase } from "../../../src/application/use-cases/create-word-search.use-case";
import { IWordSearchRepository } from "../../../src/domain/repositories/word-search.repository.interface";
import { ICatalogCacheService } from "../../../src/domain/services/catalog-cache.service.interface";
import { WordSearchGeneratorService } from "../../../src/domain/services/word-search-generator.service";

describe("CreateWordSearchUseCase", () => {
  let mockRepo: IWordSearchRepository;
  let mockCache: ICatalogCacheService;
  let generatorService: WordSearchGeneratorService;
  let useCase: CreateWordSearchUseCase;

  beforeEach(() => {
    mockRepo = {
      findCatalog: vi.fn(),
      findById: vi.fn(),
      findByCreatorId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      delete: vi.fn(),
      hasActiveRooms: vi.fn(),
      count: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    generatorService = new WordSearchGeneratorService();
    useCase = new CreateWordSearchUseCase(mockRepo, generatorService, mockCache);
  });

  it("debe crear y persistir la sopa invalidando el caché del catálogo", async () => {
    const result = await useCase.execute(
      {
        title: "Insectos y Flores",
        description: "Temática primaveral",
        category: "NATURALEZA",
        difficulty: "EASY",
        gridSize: 12,
        words: ["ABEJA", "AVISPA", "ORQUIDEA", "JAZMIN", "POLEN"],
        isPublic: true,
      },
      "user-creator-123"
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value.title).toBe("Insectos y Flores");
    expect(result.value.category).toBe("NATURALEZA");
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockCache.invalidate).toHaveBeenCalledWith("cache:catalog:*");
  });

  it("debe fallar si las palabras no cumplen los requisitos de negocio", async () => {
    const result = await useCase.execute(
      {
        title: "Error Test",
        category: "TEST",
        difficulty: "EASY",
        gridSize: 10,
        words: ["A", "B"], // Menos de 5 palabras
      },
      "user-creator-123"
    );

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(400);
  });
});
