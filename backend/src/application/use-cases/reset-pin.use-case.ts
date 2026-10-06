import { Email } from "../../domain/value-objects/email.vo";
import { Pin } from "../../domain/value-objects/pin.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { IMailService } from "../../domain/services/mail.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { InvalidOtpError, UserNotFoundError, DomainError } from "../../domain/errors/auth.errors";
import { ResetPinDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class ResetPinUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly mailService: IMailService,
    private readonly sessionCache: ISessionCacheService
  ) {}

  async execute(dto: ResetPinDto): Promise<Result<{ message: string }, DomainError>> {
    try {
      const email = Email.create(dto.email);
      const newPin = Pin.create(dto.newPin);

      // Verificar en Redis primero, o en DB como respaldo
      const cachedOtp = await this.sessionCache.getOtp(email.value);
      let isValidOtp = cachedOtp !== null && cachedOtp === dto.otpCode.trim();
      let targetUserId: string | null = null;

      if (!isValidOtp) {
        const resetRecord = await this.userRepo.findPasswordResetByOtp(email, dto.otpCode.trim());
        if (resetRecord && resetRecord.expiresAt > new Date()) {
          isValidOtp = true;
          targetUserId = resetRecord.userId;
        }
      }

      if (!isValidOtp) {
        return fail(new InvalidOtpError());
      }

      const user = targetUserId 
        ? await this.userRepo.findById(targetUserId)
        : await this.userRepo.findByEmail(email);

      if (!user) {
        return fail(new UserNotFoundError());
      }

      const newPinHash = await this.hashService.hash(newPin.value);
      user.updatePinHash(newPinHash);
      await this.userRepo.update(user);

      // Limpieza de tokens y cierre preventivo de sesiones activas
      await this.sessionCache.deleteOtp(email.value);
      await this.sessionCache.deleteSession(user.id);
      await this.userRepo.invalidatePasswordResets(user.id);

      this.mailService.sendPinChangedAlert(user.email, user.name.value).catch(console.error);

      return ok({ message: "PIN actualizado exitosamente. Por favor inicie sesión." });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
