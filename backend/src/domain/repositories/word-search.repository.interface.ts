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
  findByCreatorId(creatorId: string): Promise<WordSearch[]>;
  save(wordSearch: WordSearch): Promise<void>;
  update(wordSearch: WordSearch): Promise<void>;
  delete(id: string): Promise<void>;
  hasActiveRooms(wordSearchId: string): Promise<boolean>;
  count(): Promise<number>;
}

