import { FastifyReply, FastifyRequest } from "fastify";
import { SearchCategoriesUseCase } from "../../../application/use-cases/search-categories.use-case";
import { CreateCategoryUseCase } from "../../../application/use-cases/create-category.use-case";
import { parseOrReply, sendResult } from "./result-reply.helper";
import { categorySearchQuerySchema, createCategorySchema } from "../schemas/category.schemas";

/** Endpoints `/api/v1/categories`: buscar temas y crear uno nuevo. */
export class CategoryController {
  constructor(
    private readonly searchUseCase: SearchCategoriesUseCase,
    private readonly createUseCase: CreateCategoryUseCase
  ) {}

  search = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseOrReply(reply, categorySearchQuerySchema, req.query);
    if (!query) return;
    return sendResult(reply, await this.searchUseCase.execute(query.search));
  };

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, createCategorySchema, req.body);
    if (!body) return;
    const result = await this.createUseCase.execute(body.name, req.user!.userId);
    const status = result.isSuccess && result.value.created ? 201 : 200;
    return sendResult(reply, result, status);
  };
}
