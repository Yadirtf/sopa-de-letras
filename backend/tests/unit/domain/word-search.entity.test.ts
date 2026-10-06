import { describe, it, expect } from "vitest";
import { WordSearch } from "../../../src/domain/entities/word-search.entity";

describe("WordSearch Domain Entity", () => {
  const validProps = {
    id: "ws-1",
    title: "Fauna Silvestre",
    description: "Encuentra animales del bosque",
    category: "NATURALEZA",
    difficulty: "MEDIUM" as const,
    language: "es",
    gridSize: 12,
    wordCount: 8,
    playCount: 15,
    isPublic: true,
    creatorId: "user-1",
    creatorName: "QueenBee",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  it("debe instanciar correctamente con props válidas", () => {
    const ws = WordSearch.create(validProps);
    expect(ws.id).toBe("ws-1");
    expect(ws.title).toBe("Fauna Silvestre");
    expect(ws.category).toBe("NATURALEZA");
    expect(ws.difficulty).toBe("MEDIUM");
    expect(ws.gridSize).toBe(12);
    expect(ws.playCount).toBe(15);
  });

  it("debe lanzar error si el título es demasiado corto", () => {
    expect(() =>
      WordSearch.create({ ...validProps, title: "ab" })
    ).toThrow("El título debe tener al menos 3 caracteres");
  });

  it("debe lanzar error si el gridSize es inválido (< 8 o > 25)", () => {
    expect(() =>
      WordSearch.create({ ...validProps, gridSize: 5 })
    ).toThrow("El tamaño de cuadrícula debe estar entre 8 y 25");

    expect(() =>
      WordSearch.create({ ...validProps, gridSize: 30 })
    ).toThrow("El tamaño de cuadrícula debe estar entre 8 y 25");
  });

  it("debe incrementar el contador de partidas jugadas", () => {
    const ws = WordSearch.create(validProps);
    expect(ws.playCount).toBe(15);
    ws.incrementPlayCount();
    expect(ws.playCount).toBe(16);
  });
});
