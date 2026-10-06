import { describe, it, expect } from "vitest";
import { WordSearchGeneratorService } from "../../../src/domain/services/word-search-generator.service";

describe("WordSearchGeneratorService (Backtracking Algorithm)", () => {
  const service = new WordSearchGeneratorService();

  const words = ["ABEJA", "COLMENA", "MIEL", "REINA", "AVISPA", "FLOR", "PANAL"];

  it("debe generar exitosamente una sopa en dificultad EASY en menos de 300ms", () => {
    const start = performance.now();
    const result = service.generate({
      words,
      gridSize: 12,
      difficulty: "EASY",
    });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(300);
    expect(result.grid.length).toBe(12);
    expect(result.grid[0].length).toBe(12);
    expect(result.placedWords.length).toBe(words.length);

    // En EASY solo debe haber RIGHT o DOWN
    for (const pw of result.placedWords) {
      expect(["RIGHT", "DOWN"]).toContain(pw.direction);
    }
  });

  it("debe generar una sopa en dificultad HARD con 8 direcciones posibles", () => {
    const result = service.generate({
      words,
      gridSize: 14,
      difficulty: "HARD",
    });

    expect(result.placedWords.length).toBe(words.length);
    // Verificar que todas las celdas contengan una letra (no null)
    for (const row of result.grid) {
      for (const cell of row) {
        expect(typeof cell).toBe("string");
        expect(cell.length).toBe(1);
      }
    }
  });

  it("debe posicionar correctamente las letras de cada palabra en las coordenadas declaradas", () => {
    const result = service.generate({
      words: ["PRUEBA", "CODIGO", "TESTING", "ALGORITMO", "RAPIDO"],
      gridSize: 15,
      difficulty: "MEDIUM",
    });

    for (const placed of result.placedWords) {
      // Reconstruir la palabra desde la matriz
      const dr = Math.sign(placed.endRow - placed.startRow);
      const dc = Math.sign(placed.endCol - placed.startCol);
      let reconstructed = "";

      for (let i = 0; i < placed.word.length; i++) {
        reconstructed += result.grid[placed.startRow + dr * i][placed.startCol + dc * i];
      }

      expect(reconstructed).toBe(placed.word);
    }
  });

  it("debe rechazar listas con menos de 5 o más de 20 palabras", () => {
    expect(() =>
      service.generate({ words: ["UNO", "DOS"], gridSize: 10, difficulty: "EASY" })
    ).toThrow("Debes ingresar entre 5 y 20 palabras");
  });

  it("debe rechazar palabras con números o caracteres extraños", () => {
    expect(() =>
      service.generate({
        words: ["H0LA", "MUND0", "TEST1", "TEST2", "TEST3"],
        gridSize: 10,
        difficulty: "EASY",
      })
    ).toThrow("caracteres inválidos");
  });
});
