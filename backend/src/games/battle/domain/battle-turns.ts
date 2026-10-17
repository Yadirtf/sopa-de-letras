import { BattleMatch, EndReason, MAX_MISSED_TURNS, TURN_SECONDS } from "./battle-match.types";

/**
 * Turnos y final de la batalla. `turnSeq` sube en cada cambio de turno: un
 * reloj viejo que dispara tarde compara su numero y no corta un turno nuevo.
 */
export const VICTORY_BONUS = 20;

export function startTurn(match: BattleMatch, userId: string, now: number): void {
  match.turnUserId = userId;
  match.turnSeq += 1;
  match.turnEndsAt = now + TURN_SECONDS * 1000;
}

export function passTurn(match: BattleMatch, now: number): void {
  const next = match.players.find((p) => p.userId !== match.turnUserId);
  if (next) startTurn(match, next.userId, now);
}

/** Sorteo de quien empieza al terminar la colocacion. */
export function startPlaying(match: BattleMatch, now: number, random: () => number = Math.random): void {
  match.status = "PLAYING";
  match.lastShot = null;
  const first = match.players[Math.floor(random() * match.players.length)];
  startTurn(match, first.userId, now);
}

/**
 * Se acabo el reloj del turno `seq` sin disparo. Devuelve true si cambio algo.
 * Quien deja pasar 3 turnos seguidos (se le fue el internet, se aburrio) pierde.
 */
export function skipTurn(match: BattleMatch, seq: number, now: number): boolean {
  if (match.status !== "PLAYING" || match.turnSeq !== seq) return false;
  const idle = match.players.find((p) => p.userId === match.turnUserId);
  if (!idle) return false;
  idle.missedTurns += 1;
  if (idle.missedTurns >= MAX_MISSED_TURNS) {
    const winner = match.players.find((p) => p.userId !== idle.userId);
    finishMatch(match, winner?.userId ?? null, "IDLE");
  } else {
    passTurn(match, now);
  }
  return true;
}

export function finishMatch(match: BattleMatch, winnerUserId: string | null, reason: EndReason): void {
  match.status = "FINISHED";
  match.winnerUserId = winnerUserId;
  match.endReason = reason;
  match.turnUserId = null;
  match.turnEndsAt = null;
  const winner = match.players.find((p) => p.userId === winnerUserId);
  if (winner) winner.score += VICTORY_BONUS;
}
