import { ICategoryRepository, CategoryRecord } from "../../domain/repositories/category.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { DEFAULT_CATEGORIES, categoryKey } from "../../domain/services/category-normalizer";
import { CategoryDto } from "../dtos/category.dtos";
import { Result, ok, fail } from "../common/result";

const MAX_RESULTS = 30;

/**
 * Buscador del campo "Tema" al crear una sopa.
 * Mezcla los temas de arranque con los que ya crearon los jugadores, sin
 * duplicados, y pone primero los que empiezan por lo escrito y los mas usados.
 */
export class SearchCategoriesUseCase {
  constructor(private readonly categories: ICategoryRepository) {}

  async execute(rawTerm?: string): Promise<Result<CategoryDto[], DomainError>> {
    try {
      const term = categoryKey(rawTerm ?? "");
      const stored = await this.categories.search(term, MAX_RESULTS);

      const merged = new Map<string, CategoryRecord>();
      for (const record of stored) merged.set(record.key, record);
      for (const fallback of DEFAULT_CATEGORIES) {
        if (!merged.has(fallback.key) && fallback.key.includes(term)) {
          merged.set(fallback.key, { ...fallback, usageCount: 0 });
        }
      }

      const ranked = [...merged.values()].sort((a, b) => {
        const prefix = Number(b.key.startsWith(term)) - Number(a.key.startsWith(term));
        if (prefix !== 0) return prefix;
        if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
        return a.label.localeCompare(b.label, "es");
      });
      return ok(ranked.slice(0, MAX_RESULTS));
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
