import { BattleConfig } from "./battle-config";
import { PlacedUnit } from "./battle-board";
import { WeaponId } from "./battle-weapons";

/**
 * Estado completo de una batalla. Vive en Redis mientras dura y es secreto:
 * cada jugador solo recibe su "vista" (ver battle-views), nunca este objeto.
 */
export type BattleStatus = "WAITING" | "PLACING" | "PLAYING" | "FINISHED";
export type CellMark = "HIT" | "MISS";
export type EndReason = "DESTROYED" | "SURRENDER" | "IDLE";

export interface RadarScan {
  col: number;
  row: number;
  count: number;
}

export interface BattlePlayer {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isBot: boolean;
  isReady: boolean;
  units: PlacedUnit[];
  /** Disparos recibidos en MI tablero ("col,row" -> resultado). */
  marks: Record<string, CellMark>;
  /** Radares que YO lance sobre el tablero rival. */
  scans: RadarScan[];
  ammo: Partial<Record<WeaponId, number>>;
  score: number;
  shotsFired: number;
  hitsLanded: number;
  /** Turnos seguidos que dejo pasar sin disparar (3 = pierde). */
  missedTurns: number;
}

export interface ShotCell {
  col: number;
  row: number;
  result: "HIT" | "MISS" | "SCAN";
}

export interface DestroyedUnitInfo {
  typeId: string;
  col: number;
  row: number;
  width: number;
  height: number;
}

export interface ShotReport {
  seq: number;
  shooterId: string;
  weapon: WeaponId;
  col: number;
  row: number;
  cells: ShotCell[];
  destroyed: DestroyedUnitInfo[];
  radarCount?: number;
  keepsTurn: boolean;
}

export interface BattleMatch {
  code: string;
  hostUserId: string;
  config: BattleConfig;
  status: BattleStatus;
  players: BattlePlayer[];
  turnUserId: string | null;
  turnSeq: number;
  turnEndsAt: number | null;
  winnerUserId: string | null;
  endReason: EndReason | null;
  rematchVotes: string[];
  lastShot: ShotReport | null;
  createdAt: number;
}

export const BOT_USER_ID = "bot:abejita";
export const TURN_SECONDS = 30;
export const MAX_MISSED_TURNS = 3;
