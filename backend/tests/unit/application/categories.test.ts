import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchCategoriesUseCase } from "../../../src/application/use-cases/search-categories.use-case";
import { CreateCategoryUseCase } from "../../../src/application/use-cases/create-category.use-case";
import { ICategoryRepository } from "../../../src/domain/repositories/category.repository.interface";
import { categoryKey, categoryLabel } from "../../../src/domain/services/category-normalizer";

describe("category-normalizer", () => {
  it("unifica mayusculas, tildes y espacios en la key", () => {
    expect(categoryKey("  Tecnología   y  Ciencia! ")).toBe("TECNOLOGIA Y CIENCIA");
    expect(categoryKey("niños")).toBe("NIÑOS");
  });

  it("genera un nombre bonito conservando tildes", () => {
    expect(categoryLabel("  ANIMALES   DE LA SELVA ")).toBe("Animales de la selva");
    expect(categoryLabel("música")).toBe("Música");
  });
});

describe("SearchCategoriesUseCase", () => {
  let repo: ICategoryRepository;
  let useCase: SearchCategoriesUseCase;

  beforeEach(() => {
    repo = {
      search: vi.fn().mockResolvedValue([
        { key: "DINOSAURIOS", label: "Dinosaurios", usageCount: 4 },
        { key: "CIENCIA", label: "Ciencia", usageCount: 9 },
      ]),
      findByKey: vi.fn(),
      create: vi.fn(),
    };
    useCase = new SearchCategoriesUseCase(repo);
  });

  it("sin termino mezcla temas guardados con los de arranque sin duplicar", async () => {
    const result = await useCase.execute("");
    const keys = result.unwrap().map((c) => c.key);
    expect(keys[0]).toBe("CIENCIA");
    expect(keys).toContain("NATURALEZA");
    expect(keys.filter((k) => k === "CIENCIA")).toHaveLength(1);
  });

  it("normaliza el termino y prioriza los que empiezan por el", async () => {
    (repo.search as any).mockResolvedValue([{ key: "MUSICA LATINA", label: "Música latina", usageCount: 1 }]);
    const result = await useCase.execute("músic");
    expect(repo.search).toHaveBeenCalledWith("MUSIC", 30);
    expect(result.unwrap().map((c) => c.key)).toEqual(["MUSICA LATINA", "MUSICA"]);
  });
});

describe("CreateCategoryUseCase", () => {
  let repo: ICategoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repo = {
      search: vi.fn(),
      findByKey: vi.fn().mockResolvedValue(null),
      create: vi.fn(async (data) => ({ key: data.key, label: data.label, usageCount: 0 })),
    };
    useCase = new CreateCategoryUseCase(repo);
  });

  it("crea un tema nuevo con key normalizada", async () => {
    const result = await useCase.execute("  dinosaurios del jurásico ", "user-1");
    expect(result.unwrap()).toEqual({
      category: { key: "DINOSAURIOS DEL JURASICO", label: "Dinosaurios del jurásico", usageCount: 0 },
      created: true,
    });
    expect(repo.create).toHaveBeenCalledWith({
      key: "DINOSAURIOS DEL JURASICO",
      label: "Dinosaurios del jurásico",
      createdById: "user-1",
    });
  });

  it("reutiliza un tema equivalente en vez de duplicarlo", async () => {
    (repo.findByKey as any).mockResolvedValue({ key: "CIENCIA", label: "Ciencia", usageCount: 3 });
    const result = await useCase.execute("ciencía", "user-1");
    expect(result.unwrap().created).toBe(false);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rechaza nombres sin letras suficientes", async () => {
    const result = await useCase.execute(" ¡! ", "user-1");
    expect(result.isFailure).toBe(true);
  });
});
