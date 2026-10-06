import { ICategoryRepository } from "../../domain/repositories/category.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { InvalidCategoryNameError } from "../../domain/errors/catalog.errors";
import {
  CATEGORY_MAX_LENGTH,
  CATEGORY_MIN_LENGTH,
  DEFAULT_CATEGORIES,
  categoryKey,
  categoryLabel,
} from "../../domain/services/category-normalizer";
import { CreateCategoryResultDto } from "../dtos/category.dtos";
import { Result, ok, fail } from "../common/result";

/**
 * Crea un tema nuevo cuando ninguno encaja con la sopa que se esta armando.
 * Es idempotente: si ya existe uno equivalente ("Dinosaurios" = "DINOSAURIOS")
 * se devuelve ese, para que el catalogo no se llene de temas repetidos.
 */
export class CreateCategoryUseCase {
  constructor(private readonly categories: ICategoryRepository) {}

  async execute(rawName: string, userId: string): Promise<Result<CreateCategoryResultDto, DomainError>> {
    try {
      const key = categoryKey(rawName);
      const label = categoryLabel(rawName);
      if (key.length < CATEGORY_MIN_LENGTH || key.length > CATEGORY_MAX_LENGTH) {
        return fail(new InvalidCategoryNameError());
      }

      const existing = await this.categories.findByKey(key);
      if (existing) return ok({ category: existing, created: false });

      const fallback = DEFAULT_CATEGORIES.find((c) => c.key === key);
      const category = await this.categories.create({ key, label: fallback?.label ?? label, createdById: userId });
      return ok({ category, created: !fallback });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
