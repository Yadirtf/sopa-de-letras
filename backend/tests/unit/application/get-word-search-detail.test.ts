import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetWordSearchDetailUseCase } from "../../../src/application/use-cases/get-word-search-detail.use-case";
import { WordSearch } from "../../../src/domain/entities/word-search.entity";
import { IWordSearchRepository } from "../../../src/domain/repositories/word-search.repository.interface";

describe("GetWordSearchDetailUseCase", () => {
  let mockRepo: IWordSearchRepository;
  let useCase: GetWordSearchDetailUseCase;

  const mockEntity = WordSearch.create({
    id: "ws-detail-1",
    title: "Galaxias",
    description: "Espacio exterior y estrellas",
    category: "CIENCIA",
    difficulty: "HARD",
    language: "es",
    gridSize: 15,
    wordCount: 4,
    playCount: 100,
    isPublic: true,
    creatorId: "user-astronomer",
    creatorName: "AstroBee",
    grid: [
      ["A", "N", "D", "R", "O", "M", "E", "D", "A", "X", "Y", "Z", "A", "B", "C"],
    ],
    words: ["ANDROMEDA", "NEBULOSA", "PULSAR", "QUASAR"],
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
  });

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findCatalog: vi.fn(),
      save: vi.fn(),
      count: vi.fn(),
    };
    useCase = new GetWordSearchDetailUseCase(mockRepo);
  });

  it("debe retornar el detalle con previewGrid seguro y sin filtrar soluciones completas", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(mockEntity);

    const result = await useCase.execute("ws-detail-1");

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe("ws-detail-1");
    expect(result.value.title).toBe("Galaxias");
    expect(result.value.words).toEqual(["ANDROMEDA", "NEBULOSA", "PULSAR", "QUASAR"]);
    expect(result.value.previewGrid).toBeDefined();
    expect(result.value.previewGrid.length).toBeGreaterThanOrEqual(8);
  });

  it("debe retornar error 404 si la sopa no existe", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(null);

    const result = await useCase.execute("non-existent-id");

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(404);
    expect(result.error.message).toContain("no encontrada");
  });

  it("debe retornar error 404 si el id está vacío", async () => {
    const result = await useCase.execute("");

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(404);
  });
});
