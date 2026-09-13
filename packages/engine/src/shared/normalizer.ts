export function normalizeWord(word: string): string {
  let normalized = word.toUpperCase();
  
  // Replace accents but keep Ñ
  normalized = normalized.replace(/[ÁÀÄÂ]/g, 'A');
  normalized = normalized.replace(/[ÉÈËÊ]/g, 'E');
  normalized = normalized.replace(/[ÍÌÏÎ]/g, 'I');
  normalized = normalized.replace(/[ÓÒÖÔ]/g, 'O');
  normalized = normalized.replace(/[ÚÙÜÛ]/g, 'U');
  
  // Keep only A-Z and Ñ
  normalized = normalized.replace(/[^A-ZÑ]/g, '');
  
  return normalized;
}

export function sanitizeWordList(words: string[]): { valid: string[], invalid: string[], duplicates: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    const normalized = normalizeWord(word);
    
    if (!normalized || normalized.length < 2) {
      invalid.push(word);
    } else if (seen.has(normalized)) {
      duplicates.push(word);
    } else {
      valid.push(word);
      seen.add(normalized);
    }
  }

  return { valid, invalid, duplicates };
}
