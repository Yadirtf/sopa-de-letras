import { BattleConfig } from "./battle-config";
import { Terrain, findUnitType } from "./battle-terrains.catalog";
import { cellKey, formatCoordinate } from "./battle-coordinate";
import { battleErrors } from "./battle-errors";

/**
 * Colocacion del ejercito: figuras rectangulares que no se salen de la arena,
 * no se encima y no se tocan (tampoco en diagonal, como en la hoja de papel).
 */
export interface UnitPlacement {
  typeId: string;
  col: number;
  row: number;
  rotated: boolean;
}

export interface PlacedUnit extends UnitPlacement {
  uid: string;
  width: number;
  height: number;
  /** Casillas de la figura ya tocadas ("col,row"). */
  hitCells: string[];
}

export function unitCells(u: { col: number; row: number; width: number; height: number }): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = u.row; r < u.row + u.height; r++) for (let c = u.col; c < u.col + u.width; c++) cells.push([c, r]);
  return cells;
}

export const isDestroyed = (u: PlacedUnit): boolean => u.hitCells.length >= u.width * u.height;

/** Ids de figura que pide el ejercito, una entrada por figura, de la mas grande a la mas chica. */
export function armyRoster(config: BattleConfig, terrain: Terrain): string[] {
  return [...terrain.units]
    .sort((a, b) => b.width * b.height - a.width * a.height)
    .flatMap((u) => Array.from({ length: config.army[u.id] ?? 0 }, () => u.id));
}

/** Convierte lo que manda el jugador en figuras colocadas, o explica que esta mal. */
export function validatePlacement(config: BattleConfig, terrain: Terrain, placements: UnitPlacement[]): PlacedUnit[] {
  const expected = armyRoster(config, terrain).sort();
  const received = placements.map((p) => p.typeId).sort();
  if (expected.join("|") !== received.join("|")) {
    throw battleErrors.badPlacement("Coloca exactamente las figuras de tu ejército.");
  }

  const taken = new Map<string, number>();
  return placements.map((p, index) => {
    const type = findUnitType(terrain, p.typeId)!;
    const width = p.rotated ? type.height : type.width;
    const height = p.rotated ? type.width : type.height;
    const placed: PlacedUnit = { ...p, uid: `u${index}`, width, height, hitCells: [] };
    for (const [c, r] of unitCells(placed)) {
      if (c < 0 || r < 0 || c >= config.cols || r >= config.rows) {
        throw battleErrors.badPlacement(`${type.name} se sale de la arena.`);
      }
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const owner = taken.get(cellKey(c + dc, r + dr));
          if (owner !== undefined && owner !== index) {
            throw battleErrors.badPlacement(`${type.name} toca otra figura en ${formatCoordinate(c, r)}.`);
          }
        }
      }
    }
    unitCells(placed).forEach(([c, r]) => taken.set(cellKey(c, r), index));
    return placed;
  });
}

/** Coloca el ejercito al azar. Devuelve null si tras muchos intentos no cabe. */
export function randomPlacement(
  config: BattleConfig,
  terrain: Terrain,
  random: () => number = Math.random
): UnitPlacement[] | null {
  const roster = armyRoster(config, terrain);
  for (let attempt = 0; attempt < 80; attempt++) {
    const blocked = new Set<string>();
    const result: UnitPlacement[] = [];
    for (const typeId of roster) {
      const type = findUnitType(terrain, typeId)!;
      const spot = findSpot(config, type.width, type.height, blocked, random);
      if (!spot) break;
      result.push({ typeId, ...spot });
      const w = spot.rotated ? type.height : type.width;
      const h = spot.rotated ? type.width : type.height;
      for (let r = spot.row - 1; r <= spot.row + h; r++) {
        for (let c = spot.col - 1; c <= spot.col + w; c++) blocked.add(cellKey(c, r));
      }
    }
    if (result.length === roster.length) return result;
  }
  return null;
}

function findSpot(
  config: BattleConfig,
  width: number,
  height: number,
  blocked: Set<string>,
  random: () => number
): { col: number; row: number; rotated: boolean } | null {
  for (let tries = 0; tries < 250; tries++) {
    const rotated = width !== height && random() < 0.5;
    const w = rotated ? height : width;
    const h = rotated ? width : height;
    if (w > config.cols || h > config.rows) continue;
    const col = Math.floor(random() * (config.cols - w + 1));
    const row = Math.floor(random() * (config.rows - h + 1));
    const cells = unitCells({ col, row, width: w, height: h });
    if (cells.every(([c, r]) => !blocked.has(cellKey(c, r)))) return { col, row, rotated };
  }
  return null;
}
