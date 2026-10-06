import { FastifyRequest, FastifyReply } from "fastify";
import { PreviewWordSearchUseCase } from "../../../application/use-cases/preview-word-search.use-case";
import { CreateWordSearchUseCase } from "../../../application/use-cases/create-word-search.use-case";
import { GetMyWordSearchesUseCase } from "../../../application/use-cases/get-my-word-searches.use-case";
import { UpdateWordSearchUseCase } from "../../../application/use-cases/update-word-search.use-case";
import { DeleteWordSearchUseCase } from "../../../application/use-cases/delete-word-search.use-case";
import {
  previewWordSearchSchema,
  createWordSearchSchema,
  updateWordSearchSchema,
} from "../schemas/word-search-editor.schemas";
import { wordSearchIdParamSchema } from "../schemas/catalog.schemas";

export class WordSearchEditorController {
  constructor(
    private readonly previewUseCase: PreviewWordSearchUseCase,
    private readonly createUseCase: CreateWordSearchUseCase,
    private readonly getMyUseCase: GetMyWordSearchesUseCase,
    private readonly updateUseCase: UpdateWordSearchUseCase,
    private readonly deleteUseCase: DeleteWordSearchUseCase
  ) {}

  preview = async (req: FastifyRequest, reply: FastifyReply) => {
    const dto = previewWordSearchSchema.parse(req.body);
    const result = await this.previewUseCase.execute(dto);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const dto = createWordSearchSchema.parse(req.body);
    const userId = (req as any).user?.id;
    const result = await this.createUseCase.execute(dto, userId);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(201).send(result.value);
  };

  getMy = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req as any).user?.id;
    const result = await this.getMyUseCase.execute(userId);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  update = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = wordSearchIdParamSchema.parse(req.params);
    const dto = updateWordSearchSchema.parse(req.body);
    const userId = (req as any).user?.id;
    const result = await this.updateUseCase.execute(id, dto, userId);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  delete = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = wordSearchIdParamSchema.parse(req.params);
    const userId = (req as any).user?.id;
    const result = await this.deleteUseCase.execute(id, userId);

    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };
}
