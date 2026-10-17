import { cellKey } from "./battle-coordinate";
import { isDestroyed, unitCells } from "./battle-board";
import { battleErrors } from "./battle-errors";
import { findWeapon, impactCells } from "./battle-weapons";
import { BattleMatch, BattlePlayer, DestroyedUnitInfo, ShotCell, ShotReport } from "./battle-match.types";
import { finishMatch, passTurn, startTurn } from "./battle-turns";

/**
 * Reglas del disparo, sin red ni base de datos (se prueban solas):
 * - cada casilla da agua o tocado; la figura cae cuando todas sus casillas estan tocadas;
 * - si alguna casilla acierta (o fue radar) el tirador repite turno;
 * - puntos: 1 por casilla tocada, casillas x 5 por figura destruida, 20 al ganador.
 */
export const POINTS = { hit: 1, perDestroyedCell: 5 };

export function opponentOf(match: BattleMatch, userId: string): BattlePlayer {
  const other = match.players.find((p) => p.userId !== userId);
  if (!other) throw battleErrors.wrongPhase();
  return other;
}

export function fireShot(
  match: BattleMatch,
  shooterId: string,
  weaponId: string,
  col: number,
  row: number,
  now: number
): ShotReport {
  if (match.status !== "PLAYING") throw battleErrors.wrongPhase();
  if (match.turnUserId !== shooterId) throw battleErrors.notYourTurn();
  const { cols, rows } = match.config;
  if (col < 0 || row < 0 || col >= cols || row >= rows) throw battleErrors.outOfArena();

  const weapon = findWeapon(weaponId) ?? findWeapon("BULLET")!;
  const shooter = match.players.find((p) => p.userId === shooterId)!;
  const target = opponentOf(match, shooterId);
  const usesLeft = shooter.ammo[weapon.id];
  if (weapon.defaultUses >= 0 && !(usesLeft && usesLeft > 0)) throw battleErrors.noAmmo();

  const area = impactCells(weapon, col, row, cols, rows);
  const fresh = area.filter(([c, r]) => !target.marks[cellKey(c, r)]);
  if (weapon.damages && fresh.length === 0) throw battleErrors.alreadyShot();
  if (weapon.defaultUses >= 0) shooter.ammo[weapon.id] = (usesLeft ?? 0) - 1;
  shooter.missedTurns = 0;

  const report: ShotReport = {
    seq: (match.lastShot?.seq ?? 0) + 1,
    shooterId,
    weapon: weapon.id,
    col,
    row,
    cells: [],
    destroyed: [],
    keepsTurn: !weapon.damages,
  };

  if (!weapon.damages) {
    const occupied = new Set(target.units.flatMap((u) => unitCells(u).map(([c, r]) => cellKey(c, r))));
    report.radarCount = area.filter(([c, r]) => occupied.has(cellKey(c, r)) && !target.marks[cellKey(c, r)]).length;
    report.cells = area.map(([c, r]): ShotCell => ({ col: c, row: r, result: "SCAN" }));
    shooter.scans.push({ col, row, count: report.radarCount });
  } else {
    shooter.shotsFired += 1;
    report.cells = fresh.map(([c, r]) => resolveCell(shooter, target, c, r, report.destroyed));
    report.keepsTurn = report.cells.some((c) => c.result === "HIT");
  }

  match.lastShot = report;
  if (target.units.every(isDestroyed)) {
    finishMatch(match, shooterId, "DESTROYED");
  } else if (report.keepsTurn) {
    startTurn(match, shooterId, now); // acerto: repite con el reloj lleno
  } else {
    passTurn(match, now);
  }
  return report;
}

function resolveCell(
  shooter: BattlePlayer,
  target: BattlePlayer,
  c: number,
  r: number,
  destroyed: DestroyedUnitInfo[]
): ShotCell {
  const key = cellKey(c, r);
  const unit = target.units.find((u) => unitCells(u).some(([uc, ur]) => uc === c && ur === r));
  if (!unit) {
    target.marks[key] = "MISS";
    return { col: c, row: r, result: "MISS" };
  }
  target.marks[key] = "HIT";
  unit.hitCells.push(key);
  shooter.hitsLanded += 1;
  shooter.score += POINTS.hit;
  if (isDestroyed(unit)) {
    shooter.score += unit.width * unit.height * POINTS.perDestroyedCell;
    destroyed.push({ typeId: unit.typeId, col: unit.col, row: unit.row, width: unit.width, height: unit.height });
  }
  return { col: c, row: r, result: "HIT" };
}
