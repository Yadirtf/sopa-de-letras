/**
 * Utilidades de sanitización para palabras de sopa de letras.
 * Convierte a mayúsculas, elimina tildes/diéresis preservando la letra Ñ,
 * remueve números y caracteres especiales, y descarta duplicados.
 */

export function sanitizeWord(word: string): string {
  if (typeof word !== "string") return "";
  return word
    .trim()
    .toUpperCase()
    .replace(/[ÁÀÄÂ]/g, "A")
    .replace(/[ÉÈËÊ]/g, "E")
    .replace(/[ÍÌÏÎ]/g, "I")
    .replace(/[ÓÒÖÔ]/g, "O")
    .replace(/[ÚÙÜÛ]/g, "U")
    .replace(/[^A-ZÑ]/g, ""); // Solo permite letras mayúsculas de la A a la Z y la Ñ
}

export function sanitizeWordsList(words: string[]): string[] {
  if (!Array.isArray(words)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of words) {
    const cleaned = sanitizeWord(raw);
    if (cleaned.length >= 3 && cleaned.length <= 15 && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result;
}
