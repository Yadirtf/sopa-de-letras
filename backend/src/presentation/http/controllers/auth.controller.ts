import { FastifyRequest, FastifyReply } from "fastify";
import { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../../application/use-cases/login-user.use-case";
import { GuestLoginUseCase } from "../../../application/use-cases/guest-login.use-case";
import { ForgotPinUseCase } from "../../../application/use-cases/forgot-pin.use-case";
import { ResetPinUseCase } from "../../../application/use-cases/reset-pin.use-case";
import {
  registerSchema,
  loginSchema,
  guestLoginSchema,
  forgotPinSchema,
  resetPinSchema,
} from "../schemas/auth.schemas";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly guestLoginUseCase: GuestLoginUseCase,
    private readonly forgotPinUseCase: ForgotPinUseCase,
    private readonly resetPinUseCase: ResetPinUseCase
  ) {}

  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(req.body);
    const result = await this.registerUseCase.execute(body);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(201).send(result.value);
  };

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(req.body);
    const result = await this.loginUseCase.execute(body);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  guestLogin = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = guestLoginSchema.parse(req.body ?? {});
    const result = await this.guestLoginUseCase.execute(body);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  forgotPin = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = forgotPinSchema.parse(req.body);
    const result = await this.forgotPinUseCase.execute(body);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };

  resetPin = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = resetPinSchema.parse(req.body);
    const result = await this.resetPinUseCase.execute(body);
    if (result.isFailure) {
      return reply.status(result.error.statusCode).send({
        code: result.error.code,
        message: result.error.message,
      });
    }
    return reply.status(200).send(result.value);
  };
}
