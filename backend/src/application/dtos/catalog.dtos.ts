import { WordSearchDifficulty } from "../../domain/entities/word-search.entity";

export interface CatalogQueryDto {
  cursor?: string;
  limit?: number;
  category?: string;
  difficulty?: WordSearchDifficulty;
  search?: string;
}

export interface WordSearchSummaryDto {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: WordSearchDifficulty;
  language: string;
  gridSize: number;
  wordCount: number;
  playCount: number;
  creatorId: string;
  creatorName: string;
  createdAt: string;
}

export interface CatalogResponseDto {
  items: WordSearchSummaryDto[];
  nextCursor: string | null;
  totalCount: number;
  hasMore: boolean;
}

export interface WordSearchDetailDto {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: WordSearchDifficulty;
  language: string;
  gridSize: number;
  wordCount: number;
  words: string[];
  playCount: number;
  creatorId: string;
  creatorName: string;
  previewGrid: string[][];
  createdAt: string;
}
