import { BATTLE_TERRAINS, Terrain, TerrainId, findTerrain } from "./battle-terrains.catalog";
import { BATTLE_WEAPONS, MAX_WEAPON_USES, WeaponId } from "./battle-weapons";

/**
 * Ajustes que elige quien crea la sala. Todo llega del cliente, asi que aqui
 * se normaliza (limites, terreno valido, figuras del terreno) antes de usarlo.
 */
export type InputMode = "TAP_OR_TYPE" | "TYPE_ONLY";
export type OpponentKind = "FRIEND" | "BOT";

export interface BattleConfig {
  cols: number;
  rows: number;
  terrain: TerrainId;
  /** Cuantas figuras de cada tipo del terreno (id de figura -> cantidad). */
  army: Record<string, number>;
  /** Usos de cada arma especial; la bala no aparece porque es infinita. */
  weapons: Partial<Record<WeaponId, number>>;
  inputMode: InputMode;
  opponent: OpponentKind;
}

export const ARENA_LIMITS = { minCols: 6, maxCols: 26, minRows: 6, maxRows: 30, maxPerUnit: 6 };
/** Mas de un 35 % de casillas ocupadas deja de ser un juego de puntería. */
export const MAX_COVERAGE = 0.35;
const RECOMMENDED_COVERAGE = 0.15;

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

/** Cantidad recomendada de cada figura para que ocupen cerca del 15 % de la arena. */
export function recommendArmy(terrain: Terrain, cols: number, rows: number): Record<string, number> {
  const target = Math.max(4, Math.round(cols * rows * RECOMMENDED_COVERAGE));
  const army: Record<string, number> = Object.fromEntries(terrain.units.map((u) => [u.id, 0]));
  const fitsArena = (w: number, h: number) => Math.max(w, h) <= Math.max(cols, rows) && Math.min(w, h) <= Math.min(cols, rows);
  const largestFirst = [...terrain.units].sort((a, b) => b.width * b.height - a.width * a.height);
  let used = 0;
  let added = true;
  while (added) {
    added = false;
    for (const u of largestFirst) {
      const size = u.width * u.height;
      if (used + size > target || army[u.id] >= ARENA_LIMITS.maxPerUnit || !fitsArena(u.width, u.height)) continue;
      army[u.id] += 1;
      used += size;
      added = true;
    }
  }
  if (used === 0) army[largestFirst[largestFirst.length - 1].id] = 1;
  return army;
}

export function armyCellCount(terrain: Terrain, army: Record<string, number>): number {
  return terrain.units.reduce((sum, u) => sum + (army[u.id] ?? 0) * u.width * u.height, 0);
}

export function defaultWeapons(): Partial<Record<WeaponId, number>> {
  return Object.fromEntries(BATTLE_WEAPONS.filter((w) => w.defaultUses >= 0).map((w) => [w.id, w.defaultUses]));
}

export function normalizeConfig(input: Partial<BattleConfig> & Record<string, unknown>): BattleConfig {
  const terrain = findTerrain(String(input.terrain ?? "")) ?? BATTLE_TERRAINS[0];
  const cols = clamp(input.cols, ARENA_LIMITS.minCols, ARENA_LIMITS.maxCols, 20);
  const rows = clamp(input.rows, ARENA_LIMITS.minRows, ARENA_LIMITS.maxRows, 15);

  const requested = (input.army ?? {}) as Record<string, unknown>;
  const hasArmy = Object.keys(requested).length > 0;
  const army = hasArmy
    ? Object.fromEntries(terrain.units.map((u) => [u.id, clamp(requested[u.id], 0, ARENA_LIMITS.maxPerUnit, 0)]))
    : recommendArmy(terrain, cols, rows);

  const requestedWeapons = (input.weapons ?? {}) as Record<string, unknown>;
  const weapons = Object.fromEntries(
    BATTLE_WEAPONS.filter((w) => w.defaultUses >= 0).map((w) => [
      w.id,
      clamp(requestedWeapons[w.id], 0, MAX_WEAPON_USES, w.defaultUses),
    ])
  ) as Partial<Record<WeaponId, number>>;

  return {
    cols,
    rows,
    terrain: terrain.id,
    army,
    weapons,
    inputMode: input.inputMode === "TYPE_ONLY" ? "TYPE_ONLY" : "TAP_OR_TYPE",
    opponent: input.opponent === "BOT" ? "BOT" : "FRIEND",
  };
}
