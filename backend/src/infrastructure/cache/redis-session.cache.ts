import Redis from "ioredis";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";

export class RedisSessionCache implements ISessionCacheService {
  // Fallback in-memory para resiliencia ante cortes transitorios
  private readonly memoryStore = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly redis: Redis) {}

  async setSession(userId: string, token: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(`session:${userId}`, token, "EX", ttlSeconds);
    } catch {
      this.memoryStore.set(`session:${userId}`, {
        value: token,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async getSession(userId: string): Promise<string | null> {
    try {
      return await this.redis.get(`session:${userId}`);
    } catch {
      const item = this.memoryStore.get(`session:${userId}`);
      if (!item || item.expiresAt < Date.now()) return null;
      return item.value;
    }
  }

  async deleteSession(userId: string): Promise<void> {
    try {
      await this.redis.del(`session:${userId}`);
    } catch {
      this.memoryStore.delete(`session:${userId}`);
    }
  }

  async incrementFailedAttempts(key: string, ttlSeconds: number): Promise<number> {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, ttlSeconds);
      }
      return current;
    } catch {
      const item = this.memoryStore.get(key);
      const count = item ? parseInt(item.value, 10) + 1 : 1;
      this.memoryStore.set(key, {
        value: count.toString(),
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return count;
    }
  }

  async resetFailedAttempts(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      this.memoryStore.delete(key);
    }
  }

  async storeOtp(email: string, otpCode: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(`otp:${email}`, otpCode, "EX", ttlSeconds);
    } catch {
      this.memoryStore.set(`otp:${email}`, {
        value: otpCode,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async getOtp(email: string): Promise<string | null> {
    try {
      return await this.redis.get(`otp:${email}`);
    } catch {
      const item = this.memoryStore.get(`otp:${email}`);
      if (!item || item.expiresAt < Date.now()) return null;
      return item.value;
    }
  }

  async deleteOtp(email: string): Promise<void> {
    try {
      await this.redis.del(`otp:${email}`);
    } catch {
      this.memoryStore.delete(`otp:${email}`);
    }
  }
}
