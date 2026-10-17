import { BattleConfig } from "../domain/battle-config";
import { randomPlacement, validatePlacement } from "../domain/battle-board";
import { findTerrain } from "../domain/battle-terrains.catalog";
import { BattleMatch, BattlePlayer, BOT_USER_ID } from "../domain/battle-match.types";

/** Piezas para armar jugadores y reiniciar una batalla (crear sala, entrar, revancha). */
export interface BattleUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export function newPlayer(user: BattleUser, config: BattleConfig, isBot = false): BattlePlayer {
  return {
    userId: user.id,
    username: user.name,
    avatarUrl: user.avatarUrl ?? null,
    isBot,
    isReady: false,
    units: [],
    marks: {},
    scans: [],
    ammo: { ...config.weapons },
    score: 0,
    shotsFired: 0,
    hitsLanded: 0,
    missedTurns: 0,
  };
}

/** La Abejita coloca su ejercito al azar en cuanto entra. */
export function newBotPlayer(config: BattleConfig): BattlePlayer {
  const bot = newPlayer({ id: BOT_USER_ID, name: "Abejita" }, config, true);
  placeBot(bot, config);
  return bot;
}

export function placeBot(bot: BattlePlayer, config: BattleConfig): void {
  const terrain = findTerrain(config.terrain)!;
  const layout = randomPlacement(config, terrain);
  if (!layout) return;
  bot.units = validatePlacement(config, terrain, layout);
  bot.isReady = true;
}

/** Revancha: mismo terreno y mismas reglas, tableros limpios. */
export function resetForRematch(match: BattleMatch): void {
  match.players = match.players.map((p) => {
    const fresh = newPlayer({ id: p.userId, name: p.username, avatarUrl: p.avatarUrl }, match.config, p.isBot);
    if (p.isBot) placeBot(fresh, match.config);
    return fresh;
  });
  match.status = "PLACING";
  match.turnUserId = null;
  match.turnEndsAt = null;
  match.winnerUserId = null;
  match.endReason = null;
  match.rematchVotes = [];
  match.lastShot = null;
}

export function generateBattleCode(random: () => number = Math.random): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars.charAt(Math.floor(random() * chars.length))).join("");
}
