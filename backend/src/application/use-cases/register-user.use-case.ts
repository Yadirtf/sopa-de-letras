import { v4 as uuidv4 } from "uuid";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { Pin } from "../../domain/value-objects/pin.vo";
import { Username } from "../../domain/value-objects/username.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { ITokenService } from "../../domain/services/token.service.interface";
import { IMailService } from "../../domain/services/mail.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { UserAlreadyExistsError, DomainError } from "../../domain/errors/auth.errors";
import { RegisterUserDto, AuthResponseDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
    private readonly mailService: IMailService,
    private readonly sessionCache: ISessionCacheService
  ) {}

  async execute(dto: RegisterUserDto): Promise<Result<AuthResponseDto, DomainError>> {
    try {
      const email = Email.create(dto.email);
      const pin = Pin.create(dto.pin);
      const name = Username.create(dto.name);

      const existingUser = await this.userRepo.findByEmail(email);
      if (existingUser) {
        return fail(new UserAlreadyExistsError("email"));
      }

      const pinHash = await this.hashService.hash(pin.value);
      const userId = uuidv4();

      const user = new User({
        id: userId,
        name,
        age: dto.age,
        email,
        pinHash,
        avatarUrl: dto.avatarUrl ?? null,
        isOnline: true,
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.userRepo.save(user);

      const tokens = this.tokenService.generateTokens({
        userId: user.id,
        email: user.email.value,
        isGuest: false,
      });

      await this.sessionCache.setSession(user.id, tokens.accessToken, 24 * 3600);

      // Envio de correo transaccional no bloqueante
      this.mailService.sendWelcomeEmail(user.email, user.name.value).catch(console.error);

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
