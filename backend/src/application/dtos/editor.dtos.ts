import { PlacedWord } from "../../domain/services/word-search-generator.types";
import { WordSearchDifficulty } from "../../domain/entities/word-search.entity";

export interface PreviewWordSearchDto {
  words: string[];
  gridSize: number;
  difficulty: WordSearchDifficulty;
}

export interface PreviewWordSearchResponseDto {
  grid: string[][];
  placedWords: PlacedWord[];
  gridSize: number;
}

export interface CreateWordSearchDto {
  title: string;
  description?: string;
  category: string;
  difficulty: WordSearchDifficulty;
  gridSize: number;
  words: string[];
  isPublic?: boolean;
}

export interface UpdateWordSearchDto {
  title?: string;
  description?: string | null;
  category?: string;
  isPublic?: boolean;
}

export interface MyWordSearchItemDto {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: WordSearchDifficulty;
  gridSize: number;
  wordCount: number;
  playCount: number;
  isPublic: boolean;
  createdAt: string;
}
