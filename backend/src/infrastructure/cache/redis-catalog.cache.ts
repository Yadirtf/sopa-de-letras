import Redis from "ioredis";
import { ICatalogCacheService } from "../../domain/services/catalog-cache.service.interface";
import { CatalogResult } from "../../domain/repositories/word-search.repository.interface";
import { WordSearch } from "../../domain/entities/word-search.entity";

export class RedisCatalogCache implements ICatalogCacheService {
  private readonly memoryStore = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly redis: Redis) {}

  async get(cacheKey: string): Promise<CatalogResult | null> {
    try {
      const raw = await this.redis.get(cacheKey);
      if (!raw) return null;
      return this.deserialize(raw);
    } catch {
      const item = this.memoryStore.get(cacheKey);
      if (!item || item.expiresAt < Date.now()) return null;
      return this.deserialize(item.value);
    }
  }

  async set(cacheKey: string, result: CatalogResult, ttlSeconds = 300): Promise<void> {
    const serialized = this.serialize(result);
    try {
      await this.redis.set(cacheKey, serialized, "EX", ttlSeconds);
    } catch {
      this.memoryStore.set(cacheKey, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async invalidateCatalog(): Promise<void> {
    try {
      const keys = await this.redis.keys("cache:catalog:*");
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch {
      this.memoryStore.clear();
    }
  }

  private serialize(result: CatalogResult): string {
    const rawItems = result.items.map((ws) => ({
      id: ws.id,
      title: ws.title,
      description: ws.description,
      category: ws.category,
      difficulty: ws.difficulty,
      language: ws.language,
      gridSize: ws.gridSize,
      wordCount: ws.wordCount,
      playCount: ws.playCount,
      isPublic: ws.isPublic,
      creatorId: ws.creatorId,
      creatorName: ws.creatorName,
      createdAt: ws.createdAt.toISOString(),
      updatedAt: ws.updatedAt.toISOString(),
    }));

    return JSON.stringify({
      items: rawItems,
      nextCursor: result.nextCursor,
      totalCount: result.totalCount,
    });
  }

  private deserialize(raw: string): CatalogResult | null {
    try {
      const parsed = JSON.parse(raw);
      const items: WordSearch[] = (parsed.items || []).map((item: any) =>
        WordSearch.create({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          difficulty: item.difficulty,
          language: item.language,
          gridSize: item.gridSize,
          wordCount: item.wordCount,
          playCount: item.playCount,
          isPublic: item.isPublic,
          creatorId: item.creatorId,
          creatorName: item.creatorName,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
      );
      return {
        items,
        nextCursor: parsed.nextCursor ?? null,
        totalCount: parsed.totalCount ?? items.length,
      };
    } catch {
      return null;
    }
  }
}
