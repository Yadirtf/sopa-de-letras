import { Email } from "../../domain/value-objects/email.vo";
import { Pin } from "../../domain/value-objects/pin.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { ITokenService } from "../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import {
  InvalidCredentialsError,
  RateLimitExceededError,
  DomainError,
} from "../../domain/errors/auth.errors";
import { LoginDto, AuthResponseDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class LoginUserUseCase {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_SECONDS = 15 * 60; // 15 minutos

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
    private readonly sessionCache: ISessionCacheService
  ) {}

  async execute(dto: LoginDto): Promise<Result<AuthResponseDto, DomainError>> {
    try {
      const email = Email.create(dto.email);
      const pin = Pin.create(dto.pin);
      const rateLimitKey = `rate:login:${email.value}`;

      const attempts = await this.sessionCache.incrementFailedAttempts(
        rateLimitKey,
        LoginUserUseCase.LOCKOUT_SECONDS
      );

      if (attempts > LoginUserUseCase.MAX_ATTEMPTS) {
        return fail(new RateLimitExceededError());
      }

      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        return fail(new InvalidCredentialsError());
      }

      const isValidPin = await this.hashService.compare(pin.value, user.pinHash);
      if (!isValidPin) {
        return fail(new InvalidCredentialsError());
      }

      // Login exitoso: restablecemos el contador de intentos fallidos
      await this.sessionCache.resetFailedAttempts(rateLimitKey);

      user.setOnlineStatus(true);
      await this.userRepo.update(user);

      const tokens = this.tokenService.generateTokens({
        userId: user.id,
        email: user.email.value,
        isGuest: user.isGuest,
      });

      await this.sessionCache.setSession(user.id, tokens.accessToken, 7 * 24 * 3600);

      return ok({
        user: {
          id: user.id,
          name: user.name.value,
          age: user.age,
          email: user.email.value,
          avatarUrl: user.avatarUrl,
          isGuest: user.isGuest,
          isOnline: user.isOnline,
        },
        tokens,
      });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
