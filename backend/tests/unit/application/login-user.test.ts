import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUserUseCase } from "../../../src/application/use-cases/login-user.use-case";
import { InvalidCredentialsError, RateLimitExceededError } from "../../../src/domain/errors/auth.errors";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";

describe("LoginUserUseCase", () => {
  let userRepoMock: any;
  let hashServiceMock: any;
  let tokenServiceMock: any;
  let sessionCacheMock: any;
  let useCase: LoginUserUseCase;

  const mockUser = new User({
    id: "user-123",
    name: Username.create("AbejaReina"),
    age: 25,
    email: Email.create("reina@wordhive.com"),
    pinHash: "hash_de_prueba",
    avatarUrl: null,
    isOnline: false,
    isGuest: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    userRepoMock = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(undefined),
    };
    hashServiceMock = {
      compare: vi.fn().mockResolvedValue(true),
    };
    tokenServiceMock = {
      generateTokens: vi.fn().mockReturnValue({
        accessToken: "login_token",
        refreshToken: "refresh_token",
        expiresIn: 604800,
      }),
    };
    sessionCacheMock = {
      incrementFailedAttempts: vi.fn().mockResolvedValue(1),
      resetFailedAttempts: vi.fn().mockResolvedValue(undefined),
      setSession: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new LoginUserUseCase(
      userRepoMock,
      hashServiceMock,
      tokenServiceMock,
      sessionCacheMock
    );
  });

  it("debe autenticar al usuario con credenciales correctas", async () => {
    const result = await useCase.execute({
      email: "reina@wordhive.com",
      pin: "9999",
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.user.id).toBe("user-123");
      expect(result.value.tokens.accessToken).toBe("login_token");
    }
    expect(sessionCacheMock.resetFailedAttempts).toHaveBeenCalledOnce();
  });

  it("debe fallar con credenciales inválidas si el PIN no coincide", async () => {
    hashServiceMock.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      email: "reina@wordhive.com",
      pin: "0000",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    }
  });

  it("debe bloquear si supera el límite de intentos fallidos", async () => {
    sessionCacheMock.incrementFailedAttempts.mockResolvedValue(6);

    const result = await useCase.execute({
      email: "reina@wordhive.com",
      pin: "1111",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(RateLimitExceededError);
    }
  });
});
