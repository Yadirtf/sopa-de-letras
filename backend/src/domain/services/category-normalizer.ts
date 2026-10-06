/**
 * Una categoria tiene dos caras: la "key" con la que se guarda y filtra
 * (mayusculas, sin tildes, espacios simples) y el "label" que ve el jugador.
 * Asi "Ciencia", "ciencia " y "CIENCÍA" terminan siendo la misma categoria.
 */

export const CATEGORY_MIN_LENGTH = 2;
export const CATEGORY_MAX_LENGTH = 40;

const ACCENTS: Array<[RegExp, string]> = [
  [/[ÁÀÄÂ]/g, "A"],
  [/[ÉÈËÊ]/g, "E"],
  [/[ÍÌÏÎ]/g, "I"],
  [/[ÓÒÖÔ]/g, "O"],
  [/[ÚÙÜÛ]/g, "U"],
];

function collapseSpaces(raw: string): string {
  return (typeof raw === "string" ? raw : "").replace(/\s+/g, " ").trim();
}

export function categoryKey(raw: string): string {
  let key = collapseSpaces(raw).toUpperCase();
  for (const [pattern, letter] of ACCENTS) key = key.replace(pattern, letter);
  return key.replace(/[^A-ZÑ0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

/** Nombre bonito: conserva tildes y pone en mayuscula solo la primera letra. */
export function categoryLabel(raw: string): string {
  const clean = collapseSpaces(raw).replace(/[^\p{L}\p{N} ]/gu, "").trim();
  if (!clean) return "";
  const lower = clean.toLocaleLowerCase("es");
  return lower[0].toLocaleUpperCase("es") + lower.slice(1);
}

/** Temas de arranque: siempre aparecen aunque nadie haya creado sopas aun. */
export const DEFAULT_CATEGORIES: ReadonlyArray<{ key: string; label: string }> = [
  { key: "NATURALEZA", label: "Naturaleza" },
  { key: "ANIMALES", label: "Animales" },
  { key: "CIENCIA", label: "Ciencia" },
  { key: "TECNOLOGIA", label: "Tecnología" },
  { key: "HISTORIA", label: "Historia" },
  { key: "ARTE", label: "Arte" },
  { key: "DEPORTES", label: "Deportes" },
  { key: "COMIDA", label: "Comida" },
  { key: "GEOGRAFIA", label: "Geografía" },
  { key: "MUSICA", label: "Música" },
];
