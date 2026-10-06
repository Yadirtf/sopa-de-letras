import { CatalogResult } from "../repositories/word-search.repository.interface";

export interface ICatalogCacheService {
  get(cacheKey: string): Promise<CatalogResult | null>;
  set(cacheKey: string, result: CatalogResult, ttlSeconds?: number): Promise<void>;
  invalidateCatalog(): Promise<void>;
}
