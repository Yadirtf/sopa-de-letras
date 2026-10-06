import Redis from "ioredis";
import { IPresenceStore, PresenceSnapshot } from "../../domain/services/presence.service.interface";

/** Ventana de vida sin heartbeat; la app late cada 25 s, asi tolera 2 latidos perdidos. */
export const PRESENCE_TTL_SECONDS = 60;

/**
 * Presencia en Redis: `presence:{userId}` -> {"status":"ONLINE"|"PLAYING","roomCode":...}
 * con TTL de 60 s. Si Redis cae, sigue funcionando en memoria (mismo patron
 * que RedisSessionCache) para que la lista de amigos nunca se rompa.
 */
export class RedisPresenceCache implements IPresenceStore {
  private readonly memory = new Map<string, { snapshot: PresenceSnapshot; expiresAt: number }>();

  constructor(private readonly redis: Redis) {}

  async markOnline(userId: string): Promise<void> {
    await this.write(userId, { status: "ONLINE", roomCode: null });
  }

  async heartbeat(userId: string): Promise<boolean> {
    const current = await this.read(userId);
    if (!current) return false;
    await this.write(userId, current);
    return true;
  }

  async markPlaying(userId: string, roomCode: string): Promise<boolean> {
    if (!(await this.read(userId))) return false;
    await this.write(userId, { status: "PLAYING", roomCode });
    return true;
  }

  async markBackOnline(userId: string): Promise<boolean> {
    const current = await this.read(userId);
    if (!current || current.status !== "PLAYING") return false;
    await this.write(userId, { status: "ONLINE", roomCode: null });
    return true;
  }

  async markOffline(userId: string): Promise<void> {
    this.memory.delete(userId);
    try {
      await this.redis.del(this.key(userId));
    } catch {
      // Memoria ya limpiada
    }
  }

  async getMany(userIds: string[]): Promise<Map<string, PresenceSnapshot>> {
    const result = new Map<string, PresenceSnapshot>();
    if (userIds.length === 0) return result;
    try {
      const raws = await this.redis.mget(...userIds.map((id) => this.key(id)));
      raws.forEach((raw, i) => {
        if (raw) result.set(userIds[i], JSON.parse(raw));
      });
      return result;
    } catch {
      for (const id of userIds) {
        const snapshot = this.readMemory(id);
        if (snapshot) result.set(id, snapshot);
      }
      return result;
    }
  }

  private key(userId: string): string {
    return `presence:${userId}`;
  }

  private async read(userId: string): Promise<PresenceSnapshot | null> {
    try {
      const raw = await this.redis.get(this.key(userId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return this.readMemory(userId);
    }
  }

  private readMemory(userId: string): PresenceSnapshot | null {
    const item = this.memory.get(userId);
    if (!item || item.expiresAt < Date.now()) return null;
    return item.snapshot;
  }

  private async write(userId: string, snapshot: PresenceSnapshot): Promise<void> {
    try {
      await this.redis.set(this.key(userId), JSON.stringify(snapshot), "EX", PRESENCE_TTL_SECONDS);
    } catch {
      this.memory.set(userId, { snapshot, expiresAt: Date.now() + PRESENCE_TTL_SECONDS * 1000 });
    }
  }
}
