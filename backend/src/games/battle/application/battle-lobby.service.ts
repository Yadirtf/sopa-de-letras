import { BattleConfig, armyCellCount, MAX_COVERAGE, normalizeConfig } from "../domain/battle-config";
import { randomPlacement } from "../domain/battle-board";
import { findTerrain } from "../domain/battle-terrains.catalog";
import { battleErrors } from "../domain/battle-errors";
import { BattleMatch } from "../domain/battle-match.types";
import { finishMatch } from "../domain/battle-turns";
import { BattleUser, generateBattleCode, newBotPlayer, newPlayer } from "./battle-factory";
import { BattleMatchStore } from "./battle-ports";
import { BattleLock } from "./battle-lock";

/**
 * Crear la sala con los ajustes del anfitrion, entrar y salir.
 * Con dos jugadores (o uno contra la Abejita) la batalla pasa sola a colocar figuras.
 */
export class BattleLobbyService {
  constructor(
    private readonly store: BattleMatchStore,
    private readonly lock: BattleLock
  ) {}

  /** Revisa los ajustes y comprueba que el ejercito quepa sin que las figuras se toquen. */
  checkConfig(raw: Record<string, unknown>): BattleConfig {
    const config = normalizeConfig(raw);
    const terrain = findTerrain(config.terrain)!;
    const cells = armyCellCount(terrain, config.army);
    if (cells === 0) throw battleErrors.emptyArmy();
    if (cells > config.cols * config.rows * MAX_COVERAGE || !randomPlacement(config, terrain)) {
      throw battleErrors.armyDoesNotFit();
    }
    return config;
  }

  async create(host: BattleUser, raw: Record<string, unknown>): Promise<BattleMatch> {
    const config = this.checkConfig(raw);
    let code = generateBattleCode();
    while (await this.store.get(code)) code = generateBattleCode();

    const match: BattleMatch = {
      code,
      hostUserId: host.id,
      config,
      status: "WAITING",
      players: [newPlayer(host, config)],
      turnUserId: null,
      turnSeq: 0,
      turnEndsAt: null,
      winnerUserId: null,
      endReason: null,
      rematchVotes: [],
      lastShot: null,
      createdAt: Date.now(),
    };
    if (config.opponent === "BOT") {
      match.players.push(newBotPlayer(config));
      match.status = "PLACING";
    }
    await this.store.save(match);
    return match;
  }

  join(code: string, user: BattleUser): Promise<BattleMatch> {
    return this.lock.run(code.toUpperCase(), async () => {
      const match = await this.require(code);
      const returning = match.players.find((p) => p.userId === user.id);
      if (returning) {
        // Se completa el nombre y el avatar: el token no los trae al crear la sala.
        if (user.name.trim()) returning.username = user.name.trim();
        if (user.avatarUrl) returning.avatarUrl = user.avatarUrl;
      } else {
        if (match.status !== "WAITING" || match.players.length >= 2) throw battleErrors.full();
        match.players.push(newPlayer(user, match.config));
        match.status = "PLACING";
      }
      await this.store.save(match);
      return match;
    });
  }

  async require(code: string): Promise<BattleMatch> {
    const match = await this.store.get(code.toUpperCase());
    if (!match) throw battleErrors.notFound();
    return match;
  }
}

/** Salir antes de empezar libera el puesto; salir a mitad de batalla es rendirse. */
export function applyLeave(match: BattleMatch, userId: string): void {
  if (!match.players.some((p) => p.userId === userId)) return;
  if (match.status === "WAITING") {
    match.players = match.players.filter((p) => p.userId !== userId);
    if (match.players.length === 0) finishMatch(match, null, "SURRENDER");
  } else if (match.status !== "FINISHED") {
    const other = match.players.find((p) => p.userId !== userId);
    finishMatch(match, other?.userId ?? null, "SURRENDER");
  }
}
