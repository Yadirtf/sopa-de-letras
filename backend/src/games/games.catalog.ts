/**
 * Juegos de WordHive. Cada juego es un modulo con su carpeta, su socket y sus
 * reglas; comparten cuentas, amigos y avisos. La app arma "¿A qué jugamos?" con
 * esta lista, asi que sumar un juego es agregar una entrada y su modulo.
 */
export interface GameInfo {
  id: "word-search" | "battle";
  name: string;
  tagline: string;
  emoji: string;
  isNew: boolean;
  /** Ruta de la app donde empieza el juego. */
  appPath: string;
}

export const GAMES: GameInfo[] = [
  {
    id: "word-search",
    name: "Sopa de letras",
    tagline: "Encuentra las palabras antes que tus amigos.",
    emoji: "🔤",
    isNew: false,
    appPath: "/home/sopa",
  },
  {
    id: "battle",
    name: "La Batalla Más Temida",
    tagline: "Esconde tu ejército, elige el terreno y dispara por coordenadas.",
    emoji: "💥",
    isNew: true,
    appPath: "/batalla",
  },
];
