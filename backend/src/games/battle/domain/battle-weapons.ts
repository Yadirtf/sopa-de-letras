/**
 * Armeria. Cada arma tiene su zona de impacto y deja una marca distinta en el
 * tablero (la app la dibuja segun `id`). La bala es infinita; las demas se
 * activan al crear la sala con un numero de usos.
 */
export type WeaponId = "BULLET" | "MISSILE" | "BOMBING" | "RADAR";

export interface Weapon {
  id: WeaponId;
  name: string;
  description: string;
  /** El radar solo mira: cuenta casillas ocupadas sin hacer daño. */
  damages: boolean;
  /** Desplazamientos [columna, fila] desde la casilla elegida. */
  pattern: Array<[number, number]>;
  defaultUses: number;
}

const SQUARE_3X3: Array<[number, number]> = [-1, 0, 1].flatMap((dr) =>
  [-1, 0, 1].map((dc): [number, number] => [dc, dr])
);

export const BATTLE_WEAPONS: Weapon[] = [
  {
    id: "BULLET",
    name: "Bala",
    description: "Una casilla. Nunca se acaba.",
    damages: true,
    pattern: [[0, 0]],
    defaultUses: -1,
  },
  {
    id: "MISSILE",
    name: "Misil",
    description: "Cruz de 5 casillas.",
    damages: true,
    pattern: [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]],
    defaultUses: 3,
  },
  {
    id: "BOMBING",
    name: "Bombardeo",
    description: "Cuadro de 3 × 3.",
    damages: true,
    pattern: SQUARE_3X3,
    defaultUses: 1,
  },
  {
    id: "RADAR",
    name: "Radar",
    description: "Mira un cuadro de 3 × 3 y dice cuántas casillas ocupadas hay. No hace daño.",
    damages: false,
    pattern: SQUARE_3X3,
    defaultUses: 1,
  },
];

export const MAX_WEAPON_USES = 5;

export function findWeapon(id: string): Weapon | undefined {
  return BATTLE_WEAPONS.find((w) => w.id === id);
}

/** Casillas que toca un arma apuntada a (col, row), recortadas al borde de la arena. */
export function impactCells(
  weapon: Weapon,
  col: number,
  row: number,
  cols: number,
  rows: number
): Array<[number, number]> {
  return weapon.pattern
    .map(([dc, dr]): [number, number] => [col + dc, row + dr])
    .filter(([c, r]) => c >= 0 && r >= 0 && c < cols && r < rows);
}
