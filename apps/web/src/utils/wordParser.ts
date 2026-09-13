import { normalizeWord } from './wordNormalizer';

export interface ParseWordsResult {
  added: string[];
  duplicates: string[];
  exceeded: string[];
  invalid: string[];
}

/**
 * Procesa y limpia un texto con múltiples palabras (separadas por comas,
 * punto y coma, saltos de línea, viñetas o listas numeradas de IA).
 */
export function parseWordList(
  rawInput: string,
  gridSize: number,
  existingWords: string[]
): ParseWordsResult {
  const result: ParseWordsResult = {
    added: [],
    duplicates: [],
    exceeded: [],
    invalid: [],
  };

  if (!rawInput || !rawInput.trim()) {
    return result;
  }

  // Set de palabras ya existentes (normalizadas)
  const existingNormalized = new Set(existingWords.map(w => normalizeWord(w)));
  const newlyAddedNormalized = new Set<string>();

  // 1. Dividir por comas, punto y coma, saltos de línea, o barras
  // Reemplazar saltos de línea y punto y coma por comas
  const standardized = rawInput
    .replace(/[\r\n;]+/g, ',')
    .replace(/[•*–—]/g, ',');

  const rawTokens = standardized.split(',');

  for (let token of rawTokens) {
    // Limpiar numeraciones típicas de IA: "1. Perro" -> "Perro"
    let cleaned = token
      .replace(/^\s*\d+[\.\)\-]\s*/, '') // quitar "1. ", "2) ", "3- "
      .replace(/["'«»“”`]/g, '')        // quitar comillas
      .replace(/^[–—\-\*\s]+/, '')       // quitar guiones iniciales
      .replace(/[.]+$/, '')              // quitar punto final
      .trim();

    if (!cleaned) continue;

    const normalized = normalizeWord(cleaned);

    // Validaciones
    if (!normalized || normalized.length < 2) {
      result.invalid.push(cleaned);
    } else if (normalized.length > gridSize) {
      result.exceeded.push(`${cleaned.toUpperCase()} (${normalized.length} letras > máx ${gridSize})`);
    } else if (existingNormalized.has(normalized) || newlyAddedNormalized.has(normalized)) {
      result.duplicates.push(cleaned.toUpperCase());
    } else {
      const formatted = cleaned.toUpperCase();
      result.added.push(formatted);
      newlyAddedNormalized.add(normalized);
    }
  }

  return result;
}
