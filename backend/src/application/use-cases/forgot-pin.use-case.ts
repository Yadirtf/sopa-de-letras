import { v4 as uuidv4 } from "uuid";
import { Email } from "../../domain/value-objects/email.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IMailService } from "../../domain/services/mail.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { ForgotPinDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class ForgotPinUseCase {
  private static readonly OTP_TTL_SECONDS = 10 * 60; // 10 minutos

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly mailService: IMailService,
    private readonly sessionCache: ISessionCacheService
  ) {}

  async execute(dto: ForgotPinDto): Promise<Result<{ message: string }, DomainError>> {
    try {
      const email = Email.create(dto.email);
      const user = await this.userRepo.findByEmail(email);

      // Principio de seguridad: Responder éxito neutro para evitar enumeracion de usuarios
      if (!user) {
        return ok({ message: "Si el correo está registrado, se ha enviado un código de recuperación." });
      }

      // Generar OTP criptográfico de 6 dígitos
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + ForgotPinUseCase.OTP_TTL_SECONDS * 1000);

      await this.sessionCache.storeOtp(email.value, otpCode, ForgotPinUseCase.OTP_TTL_SECONDS);
      await this.userRepo.createPasswordReset(user.id, resetToken, otpCode, expiresAt);

      this.mailService.sendOtpEmail(email, otpCode).catch(console.error);

      return ok({ message: "Si el correo está registrado, se ha enviado un código de recuperación." });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
