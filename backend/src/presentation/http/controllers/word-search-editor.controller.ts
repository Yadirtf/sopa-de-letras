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

  private getUserId(req: FastifyRequest): string | null {
    return req.user?.userId || (req.user as any)?.id || null;
  }

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
    const userId = this.getUserId(req);
    if (!userId) {
      return reply.status(401).send({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para crear y publicar una sopa de letras",
      });
    }

    const dto = createWordSearchSchema.parse(req.body);
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
    const userId = this.getUserId(req);
    if (!userId) {
      return reply.status(401).send({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para ver tus creaciones",
      });
    }

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
    const userId = this.getUserId(req);
    if (!userId) {
      return reply.status(401).send({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para modificar una sopa de letras",
      });
    }

    const { id } = wordSearchIdParamSchema.parse(req.params);
    const dto = updateWordSearchSchema.parse(req.body);
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
    const userId = this.getUserId(req);
    if (!userId) {
      return reply.status(401).send({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para eliminar una sopa de letras",
      });
    }

    const { id } = wordSearchIdParamSchema.parse(req.params);
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
