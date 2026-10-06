import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../src/application/use-cases/register-user.use-case";
import { UserAlreadyExistsError, InvalidPinFormatError } from "../../../src/domain/errors/auth.errors";

describe("RegisterUserUseCase", () => {
  let userRepoMock: any;
  let hashServiceMock: any;
  let tokenServiceMock: any;
  let mailServiceMock: any;
  let sessionCacheMock: any;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    hashServiceMock = {
      hash: vi.fn().mockResolvedValue("hashed_pin_1234"),
    };
    tokenServiceMock = {
      generateTokens: vi.fn().mockReturnValue({
        accessToken: "access_token_xyz",
        refreshToken: "refresh_token_xyz",
        expiresIn: 604800,
      }),
    };
    mailServiceMock = {
      sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    };
    sessionCacheMock = {
      setSession: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new RegisterUserUseCase(
      userRepoMock,
      hashServiceMock,
      tokenServiceMock,
      mailServiceMock,
      sessionCacheMock
    );
  });

  it("debe registrar exitosamente a un usuario nuevo con PIN", async () => {
    const result = await useCase.execute({
      name: "Mateo_Gamer",
      age: 14,
      email: "mateo@wordhive.com",
      pin: "4321",
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.user.name).toBe("Mateo_Gamer");
      expect(result.value.user.email).toBe("mateo@wordhive.com");
      expect(result.value.tokens.accessToken).toBe("access_token_xyz");
    }
    expect(userRepoMock.save).toHaveBeenCalledOnce();
    expect(sessionCacheMock.setSession).toHaveBeenCalledOnce();
  });

  it("debe fallar si el email ya está en uso", async () => {
    userRepoMock.findByEmail.mockResolvedValue({});

    const result = await useCase.execute({
      name: "Duplicado",
      age: 20,
      email: "yaexiste@wordhive.com",
      pin: "1234",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
    }
  });

  it("debe rechazar PIN inválido", async () => {
    const result = await useCase.execute({
      name: "BadPin",
      age: 20,
      email: "badpin@wordhive.com",
      pin: "12",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(InvalidPinFormatError);
    }
  });
});
