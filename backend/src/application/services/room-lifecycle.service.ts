import { RedisRoomCache, CachedRoomState } from "../../infrastructure/cache/redis-room.cache";

/** Error de sala con un codigo estable (para la app) y un texto amable (para el jugador). */
export class RoomFlowError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

const COUNTDOWN_SECONDS = 3;

/**
 * Maquina de estados del lobby: WAITING -> COUNTDOWN -> IN_PROGRESS.
 * Cada transicion se guarda en la cache: con Redis, getRoom() devuelve una copia
 * nueva, asi que mutar el estado sin saveRoom() se pierde (era el bug de "Iniciar").
 */
export class RoomLifecycleService {
  constructor(private readonly roomCache: RedisRoomCache) {}

  async setReady(code: string, userId: string, isReady: boolean): Promise<CachedRoomState> {
    const state = await this.requireRoom(code);
    if (state.status !== "WAITING") {
      throw new RoomFlowError("PARTIDA_EN_CURSO", "La partida ya comenzó");
    }
    const player = state.players.find((p) => p.userId === userId);
    if (!player) throw new RoomFlowError("JUGADOR_NO_ENCONTRADO", "Ya no estás en esta sala");

    // El anfitrion siempre esta listo: su "listo" es pulsar Iniciar.
    player.isReady = player.isHost ? true : isReady;
    await this.roomCache.saveRoom(state);
    return state;
  }

  async beginCountdown(code: string, userId: string): Promise<{ state: CachedRoomState; countdownSeconds: number }> {
    const state = await this.requireRoom(code);
    if (state.hostUserId !== userId) {
      throw new RoomFlowError("SOLO_ANFITRION", "Solo el anfitrión puede iniciar la partida");
    }
    if (state.status !== "WAITING") {
      throw new RoomFlowError("PARTIDA_EN_CURSO", "La partida ya está empezando");
    }
    const pending = state.players.filter((p) => !p.isHost && !p.isReady);
    if (pending.length > 0) {
      const names = pending.map((p) => p.username).join(", ");
      throw new RoomFlowError("JUGADORES_NO_LISTOS", `Faltan por estar listos: ${names}`);
    }

    state.status = "COUNTDOWN";
    state.countdownStartTime = Date.now() + COUNTDOWN_SECONDS * 1000;
    await this.roomCache.saveRoom(state);
    return { state, countdownSeconds: COUNTDOWN_SECONDS };
  }

  /** Devuelve null si la cuenta atras se cancelo (sala borrada o reiniciada). */
  async startPlaying(code: string): Promise<CachedRoomState | null> {
    const state = await this.roomCache.getRoom(code);
    if (!state || state.status !== "COUNTDOWN") return null;

    state.status = "IN_PROGRESS";
    state.startedAt = Date.now();
    state.endsAt = state.timeLimitSeconds && state.timeLimitSeconds > 0
      ? state.startedAt + state.timeLimitSeconds * 1000
      : null;
    await this.roomCache.saveRoom(state);
    return state;
  }

  private async requireRoom(code: string): Promise<CachedRoomState> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new RoomFlowError("SALA_NO_ENCONTRADA", "Esta sala ya no existe");
    return state;
  }
}
