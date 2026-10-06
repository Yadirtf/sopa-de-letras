import { PrismaClient } from "@prisma/client";
import { PrismaCategoryRepository } from "../../infrastructure/database/repositories/prisma-category.repository";
import { SearchCategoriesUseCase } from "../../application/use-cases/search-categories.use-case";
import { CreateCategoryUseCase } from "../../application/use-cases/create-category.use-case";
import { CategoryController } from "../http/controllers/category.controller";

/** Temas de las sopas: buscador y alta de temas nuevos desde el editor. */
export function createCategoryContainer(prisma: PrismaClient) {
  const repository = new PrismaCategoryRepository(prisma);
  return {
    categoryController: new CategoryController(
      new SearchCategoriesUseCase(repository),
      new CreateCategoryUseCase(repository)
    ),
  };
}
