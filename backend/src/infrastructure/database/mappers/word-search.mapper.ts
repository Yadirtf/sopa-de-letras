import { WordSearch } from "../../../domain/entities/word-search.entity";

export function mapWordSearchToDomain(raw: any): WordSearch {
  const wordsArray = Array.isArray(raw.words) ? raw.words : [];
  return WordSearch.create({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    difficulty: raw.difficulty,
    language: raw.language,
    gridSize: raw.gridSize,
    wordCount: wordsArray.length,
    playCount: raw.playCount,
    isPublic: raw.isPublic,
    creatorId: raw.creatorId,
    creatorName: raw.creator?.name,
    grid: raw.grid,
    words: raw.words,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}
