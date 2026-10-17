import { UnitPlacement, randomPlacement, validatePlacement } from "../domain/battle-board";
import { chooseBotShot } from "../domain/battle-bot";
import { battleErrors } from "../domain/battle-errors";
import { BattleMatch, BattleStatus, ShotReport } from "../domain/battle-match.types";
import { fireShot } from "../domain/battle-rules";
import { findTerrain } from "../domain/battle-terrains.catalog";
import { skipTurn, startPlaying } from "../domain/battle-turns";
import { resetForRematch } from "./battle-factory";
import { applyLeave } from "./battle-lobby.service";
import { BattleLock } from "./battle-lock";
import { BattleMatchStore, BattleNotifier, BattleResultRecorder, BattleScheduler } from "./battle-ports";

const BOT_THINKING_MS = 1200;

/**
 * La batalla en marcha: colocar, disparar, relojes de turno, la Abejita y la revancha.
 * Cada cambio pasa por `mutate`: en fila por sala, se guarda, se avisa a los
 * jugadores y se programan los relojes que tocan.
 */
export class BattlePlayService {
  constructor(
    private readonly store: BattleMatchStore,
    private readonly notifier: BattleNotifier,
    private readonly scheduler: BattleScheduler,
    private readonly recorder: BattleResultRecorder,
    private readonly lock: BattleLock
  ) {}

  async randomLayout(code: string, userId: string): Promise<UnitPlacement[]> {
    const match = await this.store.get(code.toUpperCase());
    if (!match) throw battleErrors.notFound();
    this.playerOf(match, userId);
    const layout = randomPlacement(match.config, findTerrain(match.config.terrain)!);
    if (!layout) throw battleErrors.armyDoesNotFit();
    return layout;
  }

  place(code: string, userId: string, placements: UnitPlacement[]): Promise<BattleMatch> {
    return this.mutate(code, (match) => {
      if (match.status !== "PLACING") throw battleErrors.wrongPhase();
      const player = this.playerOf(match, userId);
      player.units = validatePlacement(match.config, findTerrain(match.config.terrain)!, placements);
      player.isReady = true;
      if (match.players.length === 2 && match.players.every((p) => p.isReady)) startPlaying(match, Date.now());
    });
  }

  async shoot(code: string, userId: string, weapon: string, col: number, row: number): Promise<ShotReport> {
    let report: ShotReport | undefined;
    await this.mutate(code, (match) => {
      this.playerOf(match, userId);
      report = fireShot(match, userId, weapon, col, row, Date.now());
      return report;
    });
    return report!;
  }

  rematch(code: string, userId: string): Promise<BattleMatch> {
    return this.mutate(code, (match) => {
      if (match.status !== "FINISHED") throw battleErrors.wrongPhase();
      this.playerOf(match, userId);
      const votes = new Set([...match.rematchVotes, userId, ...match.players.filter((p) => p.isBot).map((p) => p.userId)]);
      match.rematchVotes = [...votes];
      if (match.players.length === 2 && match.players.every((p) => votes.has(p.userId))) resetForRematch(match);
    });
  }

  /** Tras reiniciar el servidor los relojes se pierden: al volver un jugador se reprograman. */
  async resume(code: string): Promise<void> {
    const match = await this.store.get(code.toUpperCase());
    if (match) this.afterChange(match, match.status);
  }

  leave(code: string, userId: string): Promise<BattleMatch> {
    return this.mutate(code, (match) => applyLeave(match, userId));
  }

  private async timeout(code: string, seq: number): Promise<void> {
    await this.mutate(code, (match) => {
      if (!skipTurn(match, seq, Date.now())) throw battleErrors.wrongPhase();
    }).catch(() => undefined);
  }

  private async botMove(code: string, seq: number): Promise<void> {
    await this.mutate(code, (match) => {
      const bot = match.players.find((p) => p.isBot && p.userId === match.turnUserId);
      if (match.status !== "PLAYING" || match.turnSeq !== seq || !bot) throw battleErrors.wrongPhase();
      const shot = chooseBotShot(match, bot.userId);
      if (!shot) throw battleErrors.wrongPhase();
      return fireShot(match, bot.userId, shot.weapon, shot.col, shot.row, Date.now());
    }).catch(() => undefined);
  }

  private mutate(code: string, change: (match: BattleMatch) => ShotReport | void): Promise<BattleMatch> {
    const upper = code.toUpperCase();
    return this.lock.run(upper, async () => {
      const match = await this.store.get(upper);
      if (!match) throw battleErrors.notFound();
      const previous = match.status;
      const shot = change(match) ?? undefined;
      await this.store.save(match);
      this.notifier.publish(match, shot);
      this.afterChange(match, previous);
      return match;
    });
  }

  private afterChange(match: BattleMatch, previous: BattleStatus): void {
    if (match.status === "FINISHED" && previous !== "FINISHED") {
      this.recorder.record(match).catch(() => undefined);
      return;
    }
    if (match.status !== "PLAYING" || !match.turnEndsAt) return;
    const seq = match.turnSeq;
    this.scheduler.after(Math.max(0, match.turnEndsAt - Date.now()), () => this.timeout(match.code, seq));
    if (match.players.some((p) => p.isBot && p.userId === match.turnUserId)) {
      this.scheduler.after(BOT_THINKING_MS, () => this.botMove(match.code, seq));
    }
  }

  private playerOf(match: BattleMatch, userId: string) {
    const player = match.players.find((p) => p.userId === userId);
    if (!player) throw battleErrors.notPlayer();
    return player;
  }
}
