import Redis from "ioredis";

export interface CachedRoomState {
  id: string;
  code: string;
  wordSearchId: string;
  wordSearchTitle: string;
  hostUserId: string;
  status: 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED';
  maxPlayers: number;
  timeLimitSeconds?: number | null;
  isPrivate: boolean;
  grid: string[][];
  words: string[];
  solutions: Record<string, { start: [number, number]; end: [number, number]; word: string }>;
  players: Array<{
    userId: string;
    username: string;
    avatarUrl?: string | null;
    isHost: boolean;
    isReady: boolean;
    score: number;
    wordsFound: string[];
    colorHex: string;
    /** false mientras se le cae el internet; ausente equivale a conectado. */
    isConnected?: boolean;
  }>;
  claimedWords: Record<string, {
    userId: string;
    username: string;
    colorHex: string;
    timestamp: number;
    start?: [number, number];
    end?: [number, number];
  }>;
  rematchVotes: string[];
  startedAt?: number | null;
  endsAt?: number | null;
  countdownStartTime?: number | null;
}

export class RedisRoomCache {
  private readonly memoryFallback = new Map<string, { state: CachedRoomState; expiresAt: number }>();
  private readonly TTL_SECONDS = 7200; // 2 horas (US-14)

  constructor(private readonly redis: Redis) {}

  private getKey(code: string): string {
    return `room:state:${code.toUpperCase()}`;
  }

  async saveRoom(state: CachedRoomState): Promise<void> {
    const key = this.getKey(state.code);
    const json = JSON.stringify(state);
    try {
      await this.redis.set(key, json, "EX", this.TTL_SECONDS);
    } catch {
      // Fallback in-memory
    }
    this.memoryFallback.set(state.code.toUpperCase(), {
      state,
      expiresAt: Date.now() + this.TTL_SECONDS * 1000,
    });
  }

  async getRoom(code: string): Promise<CachedRoomState | null> {
    const upperCode = code.toUpperCase();
    const key = this.getKey(upperCode);
    try {
      const data = await this.redis.get(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    const fallback = this.memoryFallback.get(upperCode);
    if (fallback) {
      if (Date.now() > fallback.expiresAt) {
        this.memoryFallback.delete(upperCode);
        return null;
      }
      return fallback.state;
    }
    return null;
  }

  async deleteRoom(code: string): Promise<void> {
    const upperCode = code.toUpperCase();
    try {
      await this.redis.del(this.getKey(upperCode));
    } catch {
      // Fallback
    }
    this.memoryFallback.delete(upperCode);
  }
}
