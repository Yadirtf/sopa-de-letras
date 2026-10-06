import { FastifyRequest, FastifyReply } from "fastify";
import { GetProfileUseCase } from "../../../application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../../application/use-cases/update-profile.use-case";
import { UpdatePinUseCase } from "../../../application/use-cases/update-pin.use-case";
import { updatePinSchema, updateProfileSchema } from "../schemas/auth.schemas";
import { parseOrReply, sendResult } from "./result-reply.helper";

export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updatePinUseCase: UpdatePinUseCase
  ) {}

  getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    return sendResult(reply, await this.getProfileUseCase.execute(req.user!.userId));
  };

  // parseOrReply: un nombre corto responde 400 legible, no un 500 por ZodError.
  updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, updateProfileSchema, req.body);
    if (!body) return reply;
    return sendResult(reply, await this.updateProfileUseCase.execute({ userId: req.user!.userId, ...body }));
  };

  updatePin = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, updatePinSchema, req.body);
    if (!body) return reply;
    return sendResult(reply, await this.updatePinUseCase.execute({ userId: req.user!.userId, ...body }));
  };
}
