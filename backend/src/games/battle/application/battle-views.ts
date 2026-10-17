import { isDestroyed, unitCells } from "../domain/battle-board";
import { BattleMatch, BattlePlayer, CellMark, DestroyedUnitInfo } from "../domain/battle-match.types";

/**
 * Lo que ve cada jugador. Su tablero completo, y del rival solo los disparos
 * que el mismo hizo y las figuras que ya cayeron. Al terminar se revela todo.
 */
export interface MarkView {
  col: number;
  row: number;
  mark: CellMark;
}

const marksOf = (player: BattlePlayer): MarkView[] =>
  Object.entries(player.marks).map(([key, mark]) => {
    const [col, row] = key.split(",").map(Number);
    return { col, row, mark };
  });

const unitInfo = (u: BattlePlayer["units"][number]): DestroyedUnitInfo => ({
  typeId: u.typeId,
  col: u.col,
  row: u.row,
  width: u.width,
  height: u.height,
});

export function publicPlayer(p: BattlePlayer) {
  return {
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl ?? null,
    isBot: p.isBot,
    isReady: p.isReady,
    score: p.score,
    unitsTotal: p.units.length,
    unitsAlive: p.units.filter((u) => !isDestroyed(u)).length,
    shotsFired: p.shotsFired,
    hitsLanded: p.hitsLanded,
    missedTurns: p.missedTurns,
  };
}

export function viewFor(match: BattleMatch, userId: string) {
  const me = match.players.find((p) => p.userId === userId);
  const enemy = match.players.find((p) => p.userId !== userId);
  const finished = match.status === "FINISHED";
  return {
    code: match.code,
    status: match.status,
    config: match.config,
    hostUserId: match.hostUserId,
    myUserId: userId,
    players: match.players.map(publicPlayer),
    turnUserId: match.turnUserId,
    turnEndsAt: match.turnEndsAt,
    serverTime: Date.now(),
    winnerUserId: match.winnerUserId,
    endReason: match.endReason,
    rematchVotes: match.rematchVotes,
    myAmmo: me?.ammo ?? {},
    myBoard: {
      units: (me?.units ?? []).map((u) => ({ ...unitInfo(u), rotated: u.rotated, hitCells: u.hitCells })),
      marks: me ? marksOf(me) : [],
    },
    enemyBoard: {
      marks: enemy ? marksOf(enemy) : [],
      revealed: (enemy?.units ?? []).filter((u) => finished || isDestroyed(u)).map(unitInfo),
      scans: me?.scans ?? [],
      occupiedCells: enemy ? enemy.units.reduce((n, u) => n + unitCells(u).length, 0) : 0,
    },
    lastShot: match.lastShot,
  };
}

export type BattleView = ReturnType<typeof viewFor>;
