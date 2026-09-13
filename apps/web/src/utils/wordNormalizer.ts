/**
 * Normaliza una palabra para comparación en la sopa de letras:
 * - Convierte a mayúsculas
 * - Elimina acentos (Á->A, É->E, Í->I, Ó->O, Ú->U, Ü->U) preservando la Ñ
 * - Remueve espacios, guiones y cualquier carácter no alfabético
 */
export function normalizeWord(word: string): string {
  if (!word) return '';
  let normalized = word.toUpperCase();
  
  // Reemplazar acentos y diéresis manteniendo la Ñ
  normalized = normalized.replace(/[ÁÀÄÂ]/g, 'A');
  normalized = normalized.replace(/[ÉÈËÊ]/g, 'E');
  normalized = normalized.replace(/[ÍÌÏÎ]/g, 'I');
  normalized = normalized.replace(/[ÓÒÖÔ]/g, 'O');
  normalized = normalized.replace(/[ÚÙÜÛ]/g, 'U');
  
  // Mantener únicamente letras de la A a la Z y la Ñ
  normalized = normalized.replace(/[^A-ZÑ]/g, '');
  
  return normalized;
}

/**
 * Compara dos palabras ignorando espacios, mayúsculas y acentos.
 */
export function areWordsEqual(wordA: string, wordB: string): boolean {
  return normalizeWord(wordA) === normalizeWord(wordB);
}
