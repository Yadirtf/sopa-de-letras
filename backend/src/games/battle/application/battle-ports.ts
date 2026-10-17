import { BattleMatch, ShotReport } from "../domain/battle-match.types";

/** Donde vive la batalla mientras se juega (Redis en produccion, memoria en pruebas). */
export interface BattleMatchStore {
  get(code: string): Promise<BattleMatch | null>;
  save(match: BattleMatch): Promise<void>;
}

/** Guarda el resultado final (PostgreSQL). Nunca debe tumbar la partida si falla. */
export interface BattleResultRecorder {
  record(match: BattleMatch): Promise<void>;
}

/** Avisa a los jugadores (por socket) que la batalla cambio; cada uno recibe solo su vista. */
export interface BattleNotifier {
  publish(match: BattleMatch, shot?: ShotReport): void;
}

/** Relojes: turnos de 30 s y la "pensada" de la Abejita. */
export interface BattleScheduler {
  after(ms: number, task: () => Promise<void>): void;
}

/** Avisa al modulo social que alguien entro o salio de una batalla, para que sus amigos lo vean "En partida". */
export interface BattlePresenceListener {
  onPlayerJoined(userId: string, code: string): void;
  onPlayerLeft(userId: string): void;
}
