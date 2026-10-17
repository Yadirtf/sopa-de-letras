import { PrismaClient } from "@prisma/client";
import { BattleMatch } from "../domain/battle-match.types";
import { BattleResultRecorder, BattleScheduler } from "../application/battle-ports";
import { BattleUser } from "../application/battle-factory";

/** Guarda en PostgreSQL como termino cada batalla (la Abejita no es usuario: va solo en el JSON). */
export class PrismaBattleResultRecorder implements BattleResultRecorder {
  constructor(private readonly prisma: PrismaClient) {}

  async record(match: BattleMatch): Promise<void> {
    await this.prisma.battleMatch.create({
      data: {
        code: match.code,
        terrain: match.config.terrain,
        cols: match.config.cols,
        rows: match.config.rows,
        winnerUserId: match.winnerUserId,
        endReason: match.endReason ?? "SURRENDER",
        players: match.players.map((p) => ({
          userId: p.userId,
          username: p.username,
          isBot: p.isBot,
          score: p.score,
          shotsFired: p.shotsFired,
          hitsLanded: p.hitsLanded,
        })),
      },
    });
  }
}

/** Nombre y avatar salen de la base de datos, no de lo que diga el cliente. */
export class PrismaBattleUserDirectory {
  constructor(private readonly prisma: PrismaClient) {}

  async find(userId: string): Promise<BattleUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true },
    });
    return user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : null;
  }
}

export class TimerBattleScheduler implements BattleScheduler {
  after(ms: number, task: () => Promise<void>): void {
    const timer = setTimeout(() => void task().catch(() => undefined), ms);
    timer.unref?.();
  }
}
