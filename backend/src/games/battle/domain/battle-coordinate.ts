/**
 * Coordenadas como se dicen en papel: columna con letra (A a Z) y fila con
 * numero desde 1. Se aceptan "H11", "H-11", "11-H", "11 h"... Internamente
 * todo es 0-based: [columna, fila].
 */
export const COLUMN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function columnLetter(col: number): string {
  return COLUMN_LETTERS.charAt(col);
}

export function formatCoordinate(col: number, row: number): string {
  return `${columnLetter(col)}${row + 1}`;
}

export function parseCoordinate(text: string): [number, number] | null {
  const clean = text.trim().toUpperCase().replace(/[\s\-_,.:/]+/g, "");
  const match = /^([A-Z])(\d{1,2})$/.exec(clean) ?? /^(\d{1,2})([A-Z])$/.exec(clean);
  if (!match) return null;
  const letter = /[A-Z]/.test(match[1]) ? match[1] : match[2];
  const number = /[A-Z]/.test(match[1]) ? match[2] : match[1];
  const row = Number(number) - 1;
  if (row < 0) return null;
  return [COLUMN_LETTERS.indexOf(letter), row];
}

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}
