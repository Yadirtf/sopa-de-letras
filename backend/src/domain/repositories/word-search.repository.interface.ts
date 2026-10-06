import { WordSearch, WordSearchDifficulty } from "../entities/word-search.entity";

export interface CatalogFilterOptions {
  cursor?: string;
  limit: number;
  category?: string;
  difficulty?: WordSearchDifficulty;
  search?: string;
}

export interface CatalogResult {
  items: WordSearch[];
  nextCursor: string | null;
  totalCount: number;
}

export interface IWordSearchRepository {
  findCatalog(options: CatalogFilterOptions): Promise<CatalogResult>;
  findById(id: string): Promise<WordSearch | null>;
  save(wordSearch: WordSearch): Promise<void>;
  count(): Promise<number>;
}
