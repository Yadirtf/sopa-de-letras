import { v4 as uuidv4 } from "uuid";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { Username } from "../../domain/value-objects/username.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { ITokenService } from "../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { GuestLoginDto, AuthResponseDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class GuestLoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
    private readonly sessionCache: ISessionCacheService
  ) {}

  async execute(dto: GuestLoginDto): Promise<Result<AuthResponseDto, DomainError>> {
    try {
      const guestId = uuidv4();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const guestNameStr = dto.name || `Abeja_${randomSuffix}`;
      const guestName = Username.create(guestNameStr);
      const guestEmail = Email.create(`guest_${guestId.slice(0, 8)}@wordhive.local`);

      // PIN aleatorio inaccesible para invitados
      const dummyPin = Math.floor(1000 + Math.random() * 9000).toString();
      const pinHash = await this.hashService.hash(dummyPin);

      const guestUser = new User({
        id: guestId,
        name: guestName,
        age: 18,
        email: guestEmail,
        pinHash,
        avatarUrl: dto.avatarUrl ?? null,
        isOnline: true,
        isGuest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.userRepo.save(guestUser);

      const tokens = this.tokenService.generateTokens({
        userId: guestUser.id,
        email: guestUser.email.value,
        isGuest: true,
      });

      // Sesion de invitado valida por 24 horas
      await this.sessionCache.setSession(guestUser.id, tokens.accessToken, 24 * 3600);

      return ok({
        user: {
          id: guestUser.id,
          name: guestUser.name.value,
          age: guestUser.age,
          email: guestUser.email.value,
          avatarUrl: guestUser.avatarUrl,
          isGuest: true,
          isOnline: true,
        },
        tokens,
      });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
