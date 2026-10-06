import { RedisRoomCache, CachedRoomState } from "../../infrastructure/cache/redis-room.cache";

/** Tiempo que el lobby le guarda el puesto a quien se quedo sin internet. */
export const RECONNECT_GRACE_MS = 90_000;

/**
 * Caidas de internet en una sala.
 *
 * Perder la conexion NO es abandonar: el jugador queda marcado como
 * desconectado (los demas lo ven "reconectando") y conserva su puesto.
 * En plena partida lo conserva siempre; en el lobby, si no vuelve dentro de la
 * gracia, se libera el puesto para que la sala no quede bloqueada por un fantasma.
 * Salir de verdad solo ocurre con "Abandonar sala" (room:leave).
 */
export class RoomConnectionService {
  private readonly pendingRemovals = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly roomCache: RedisRoomCache,
    private readonly graceMs: number = RECONNECT_GRACE_MS
  ) {}

  /** Devuelve la sala actualizada, o null si no habia nada que cambiar. */
  async markDisconnected(code: string, userId: string): Promise<CachedRoomState | null> {
    const state = await this.roomCache.getRoom(code);
    const player = state?.players.find((p) => p.userId === userId);
    if (!state || !player || player.isConnected === false) return null;
    player.isConnected = false;
    await this.roomCache.saveRoom(state);
    return state;
  }

  /** True si sigue fuera de linea y la sala aun esta en el lobby (en partida nunca se le saca). */
  async shouldRelease(code: string, userId: string): Promise<boolean> {
    const state = await this.roomCache.getRoom(code);
    const player = state?.players.find((p) => p.userId === userId);
    return !!state && state.status === "WAITING" && player?.isConnected === false;
  }

  /**
   * Programa la liberacion del puesto. Una caida nueva reinicia el plazo; si el
   * jugador vuelve antes, onExpire lo detecta con shouldRelease() y no hace nada.
   */
  scheduleRelease(code: string, userId: string, onExpire: () => Promise<void>): void {
    const key = `${code}:${userId}`;
    clearTimeout(this.pendingRemovals.get(key));
    const timer = setTimeout(() => {
      this.pendingRemovals.delete(key);
      onExpire().catch(() => undefined);
    }, this.graceMs);
    timer.unref?.();
    this.pendingRemovals.set(key, timer);
  }
}
