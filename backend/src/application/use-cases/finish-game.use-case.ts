import { IRoomRepository } from "../../domain/repositories/room.repository.interface";
import { RedisRoomCache } from "../../infrastructure/cache/redis-room.cache";
import { PodiumItemDto } from "../dtos/room.dto";
import { NotificationDispatcher } from "../services/notification-dispatcher.service";

/** Solo el podio genera un logro en la campana; mas que eso seria ruido (US-25). */
const ACHIEVEMENT_MAX_RANK = 3;

export class FinishGameUseCase {
  constructor(
    private readonly roomRepo: IRoomRepository,
    private readonly roomCache: RedisRoomCache,
    private readonly notifier?: NotificationDispatcher
  ) {}

  async execute(code: string): Promise<{
    podium: PodiumItemDto[];
    totalWords: number;
    durationSeconds: number;
  }> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new Error('SALA_NO_ENCONTRADA');

    state.status = 'FINISHED';
    const now = Date.now();
    state.endsAt = now;
    await this.roomCache.saveRoom(state);

    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

    const trophyTiers = [30, 20, 10]; // 1º, 2º, 3º lugar

    const podium: PodiumItemDto[] = sortedPlayers.map((player, index) => {
      const rank = index + 1;
      const baseTrophy = trophyTiers[index] || 5;
      const wordBonus = player.wordsFound.length * 3;
      const trophiesEarned = baseTrophy + wordBonus;

      return {
        rank,
        userId: player.userId,
        username: player.username,
        avatarUrl: player.avatarUrl,
        score: player.score,
        wordsCount: player.wordsFound.length,
        trophiesEarned,
      };
    });

    // Persist results into PostgreSQL
    try {
      await this.roomRepo.updateStatus(state.id, 'FINISHED', state.startedAt ? new Date(state.startedAt) : undefined, new Date());
      await this.roomRepo.saveMatchResults(
        state.id,
        podium.map((p) => {
          const originalPlayer = state.players.find((pl) => pl.userId === p.userId);
          return {
            userId: p.userId,
            score: p.score,
            rank: p.rank,
            wordsFound: originalPlayer?.wordsFound || [],
          };
        })
      );
    } catch {
      // In-memory or database graceful continuation
    }

    this.recordAchievements(state.code, state.wordSearchTitle, podium);

    const durationSeconds = state.startedAt
      ? Math.max(1, Math.round((now - state.startedAt) / 1000))
      : (state.timeLimitSeconds || 0);

    return {
      podium,
      totalWords: state.words.length,
      durationSeconds,
    };
  }

  private recordAchievements(roomCode: string, wordSearchTitle: string, podium: PodiumItemDto[]): void {
    if (!this.notifier || podium.length < 2) return;
    for (const item of podium.filter((p) => p.rank <= ACHIEVEMENT_MAX_RANK)) {
      // El dispatcher nunca lanza: jugadores anonimos sin fila en BD simplemente se omiten.
      void this.notifier.notify({
        recipientId: item.userId,
        type: "GAME_END",
        payload: {
          roomCode,
          wordSearchTitle,
          rank: item.rank,
          trophiesEarned: item.trophiesEarned,
          totalPlayers: podium.length,
        },
      });
    }
  }
}
