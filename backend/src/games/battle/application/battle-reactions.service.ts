import { BOT_REPLIES, isBattleReaction, BattleReactionId } from "../domain/battle-reactions";
import { BattleError, battleErrors } from "../domain/battle-errors";
import { BattleMatchStore, BattleScheduler } from "./battle-ports";

/** Una reaccion en camino: quien la manda, cual es y a quien le llega. */
export interface BattleReactionEvent {
  code: string;
  fromUserId: string;
  toUserId: string;
  reaction: BattleReactionId;
}

export interface BattleReactionSink {
  deliver(event: BattleReactionEvent): void;
}

/** Entre dos reacciones del mismo jugador: suficiente para que no sea spam. */
export const REACTION_COOLDOWN_MS = 1500;
const BOT_REPLY_MS = 1400;

/**
 * Reacciones en vivo entre los dos jugadores. No se guardan: van directo
 * al rival. La Abejita contesta a veces, como un rival de verdad.
 */
export class BattleReactionsService {
  private readonly lastSent = new Map<string, number>();

  constructor(
    private readonly store: BattleMatchStore,
    private readonly sink: BattleReactionSink,
    private readonly scheduler: BattleScheduler,
    private readonly clock: () => number = Date.now,
    private readonly chance: () => number = Math.random
  ) {}

  async send(code: string, userId: string, reaction: unknown): Promise<void> {
    if (!isBattleReaction(reaction)) throw new BattleError("REACCION_INVALIDA", "Esa reacción no existe.");
    const match = await this.store.get(code.toUpperCase());
    if (!match) throw battleErrors.notFound();
    if (!match.players.some((p) => p.userId === userId)) throw battleErrors.notPlayer();
    const rival = match.players.find((p) => p.userId !== userId);
    if (!rival || match.status === "WAITING") throw battleErrors.wrongPhase();

    const key = `${match.code}:${userId}`;
    const now = this.clock();
    if (now - (this.lastSent.get(key) ?? 0) < REACTION_COOLDOWN_MS) {
      throw new BattleError("REACCION_MUY_SEGUIDA", "Espera un momento antes de mandar otra reacción.");
    }
    this.lastSent.set(key, now);

    if (!rival.isBot) {
      this.sink.deliver({ code: match.code, fromUserId: userId, toUserId: rival.userId, reaction });
    } else if (this.chance() < 0.6) {
      this.scheduler.after(BOT_REPLY_MS, async () =>
        this.sink.deliver({ code: match.code, fromUserId: rival.userId, toUserId: userId, reaction: BOT_REPLIES[reaction] })
      );
    }
  }
}
