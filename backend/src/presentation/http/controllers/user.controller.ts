import { FastifyRequest, FastifyReply } from "fastify";
import { GetProfileUseCase } from "../../../application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../../application/use-cases/update-profile.use-case";
import { UpdatePinUseCase } from "../../../application/use-cases/update-pin.use-case";
import { updatePinSchema, updateProfileSchema } from "../schemas/auth.schemas";

export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updatePinUseCase: UpdatePinUseCase
  ) {}

  getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const result = await this.getProfileUseCase.execute(userId);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const body = updateProfileSchema.parse(req.body);
    const result = await this.updateProfileUseCase.execute({ userId, ...body });
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  updatePin = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const body = updatePinSchema.parse(req.body);
    const result = await this.updatePinUseCase.execute({ userId, ...body });
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };
}
