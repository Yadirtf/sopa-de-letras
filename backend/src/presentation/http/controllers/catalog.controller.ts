import { FastifyRequest, FastifyReply } from "fastify";
import { GetCatalogListUseCase } from "../../../application/use-cases/get-catalog-list.use-case";
import { GetWordSearchDetailUseCase } from "../../../application/use-cases/get-word-search-detail.use-case";
import { catalogQuerySchema, wordSearchIdParamSchema } from "../schemas/catalog.schemas";

export class CatalogController {
  constructor(
    private readonly getCatalogListUseCase: GetCatalogListUseCase,
    private readonly getWordSearchDetailUseCase: GetWordSearchDetailUseCase
  ) {}

  getCatalog = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = catalogQuerySchema.parse(req.query);
    const result = await this.getCatalogListUseCase.execute(query);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }

    return reply.status(200).send(result.value);
  };

  getWordSearchDetail = async (req: FastifyRequest, reply: FastifyReply) => {
    const params = wordSearchIdParamSchema.parse(req.params);
    const result = await this.getWordSearchDetailUseCase.execute(params.id);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }

    return reply.status(200).send(result.value);
  };
}
