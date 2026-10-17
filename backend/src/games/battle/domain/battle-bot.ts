import { cellKey } from "./battle-coordinate";
import { isDestroyed, unitCells } from "./battle-board";
import { WeaponId } from "./battle-weapons";
import { BattleMatch } from "./battle-match.types";

/**
 * La Abejita, rival de practica. Solo usa lo que un jugador sabria mirando su
 * tablero: sus aciertos, sus fallos y las figuras que ya destruyo.
 * - Si tiene un tocado pendiente, busca alrededor (y en linea si ya van dos).
 * - Si no, barre en damero, saltando el borde de las figuras caidas (no se tocan).
 */
export interface BotShot {
  weapon: WeaponId;
  col: number;
  row: number;
}

export function chooseBotShot(match: BattleMatch, botId: string, random: () => number = Math.random): BotShot | null {
  const bot = match.players.find((p) => p.userId === botId);
  const enemy = match.players.find((p) => p.userId !== botId);
  if (!bot || !enemy) return null;
  const { cols, rows } = match.config;
  const marked = (c: number, r: number) => Boolean(enemy.marks[cellKey(c, r)]);
  const inside = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows;

  // Alrededor de una figura destruida no puede haber otra: esas casillas no se gastan.
  const ruledOut = new Set<string>();
  for (const unit of enemy.units.filter(isDestroyed)) {
    for (const [c, r] of unitCells(unit)) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) ruledOut.add(cellKey(c + dc, r + dr));
    }
  }

  const pendingHits = Object.entries(enemy.marks)
    .filter(([key, mark]) => mark === "HIT" && !ruledOut.has(key))
    .map(([key]) => key.split(",").map(Number) as [number, number]);

  const free = (c: number, r: number) => inside(c, r) && !marked(c, r) && !ruledOut.has(cellKey(c, r));
  const isHit = (c: number, r: number) => pendingHits.some(([hc, hr]) => hc === c && hr === r);
  // Vecinos de cada tocado; "en linea" si detras del tocado hay otro tocado en el mismo eje.
  const around = pendingHits.flatMap(([hc, hr]) =>
    [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .filter(([dc, dr]) => free(hc + dc, hr + dr))
      .map(([dc, dr]) => ({ col: hc + dc, row: hr + dr, inLine: isHit(hc - dc, hr - dr) }))
  );
  if (around.length > 0) {
    const inLine = around.filter((spot) => spot.inLine);
    const pool = inLine.length > 0 ? inLine : around;
    const { col, row } = pool[Math.floor(random() * pool.length)];
    return { weapon: "BULLET", col, row };
  }

  const hunt: Array<[number, number]> = [];
  const anyFree: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!free(c, r)) continue;
      anyFree.push([c, r]);
      if ((c + r) % 2 === 0) hunt.push([c, r]);
    }
  }
  const pool = hunt.length > 0 ? hunt : anyFree;
  if (pool.length === 0) return firstUnmarked(match, enemy.marks);
  const [col, row] = pool[Math.floor(random() * pool.length)];
  const roll = random();
  const weapon: WeaponId =
    (bot.ammo.BOMBING ?? 0) > 0 && roll < 0.1 ? "BOMBING" : (bot.ammo.MISSILE ?? 0) > 0 && roll < 0.25 ? "MISSILE" : "BULLET";
  return { weapon, col, row };
}

function firstUnmarked(match: BattleMatch, marks: Record<string, string>): BotShot | null {
  for (let r = 0; r < match.config.rows; r++) {
    for (let c = 0; c < match.config.cols; c++) if (!marks[cellKey(c, r)]) return { weapon: "BULLET", col: c, row: r };
  }
  return null;
}
