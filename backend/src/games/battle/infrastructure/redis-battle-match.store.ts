import Redis from "ioredis";
import { BattleMatch } from "../domain/battle-match.types";
import { BattleMatchStore } from "../application/battle-ports";

/**
 * Batallas en curso en Redis (`battle:match:CODIGO`, 4 h). Si Redis no
 * responde (desarrollo local) se usa una copia en memoria, igual que las salas.
 */
export class RedisBattleMatchStore implements BattleMatchStore {
  private readonly ttlSeconds = 4 * 3600;
  private readonly memory = new Map<string, { json: string; expiresAt: number }>();

  constructor(private readonly redis: Redis) {}

  private key(code: string): string {
    return `battle:match:${code.toUpperCase()}`;
  }

  async get(code: string): Promise<BattleMatch | null> {
    try {
      const json = await this.redis.get(this.key(code));
      if (json) return JSON.parse(json);
    } catch {
      // Sin Redis: memoria.
    }
    const cached = this.memory.get(code.toUpperCase());
    if (!cached || cached.expiresAt < Date.now()) return null;
    return JSON.parse(cached.json);
  }

  async save(match: BattleMatch): Promise<void> {
    const json = JSON.stringify(match);
    try {
      await this.redis.set(this.key(match.code), json, "EX", this.ttlSeconds);
    } catch {
      // Sin Redis: memoria.
    }
    this.memory.set(match.code.toUpperCase(), { json, expiresAt: Date.now() + this.ttlSeconds * 1000 });
  }
}

/** Para pruebas: lo mismo sin Redis. */
export class InMemoryBattleMatchStore implements BattleMatchStore {
  private readonly matches = new Map<string, string>();

  async get(code: string): Promise<BattleMatch | null> {
    const json = this.matches.get(code.toUpperCase());
    return json ? JSON.parse(json) : null;
  }

  async save(match: BattleMatch): Promise<void> {
    this.matches.set(match.code.toUpperCase(), JSON.stringify(match));
  }
}
