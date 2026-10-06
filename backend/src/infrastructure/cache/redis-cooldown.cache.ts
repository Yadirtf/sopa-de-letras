import Redis from "ioredis";
import { ICooldownStore } from "../../domain/services/cooldown.service.interface";

/** SET NX EX: atomico en Redis, con respaldo en memoria si Redis no responde. */
export class RedisCooldownCache implements ICooldownStore {
  private readonly memory = new Map<string, number>();

  constructor(private readonly redis: Redis) {}

  async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.redis.set(key, "1", "EX", ttlSeconds, "NX");
      return result === "OK";
    } catch {
      const now = Date.now();
      const until = this.memory.get(key);
      if (until && until > now) return false;
      this.memory.set(key, now + ttlSeconds * 1000);
      return true;
    }
  }
}
