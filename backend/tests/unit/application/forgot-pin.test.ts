import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForgotPinUseCase } from "../../../src/application/use-cases/forgot-pin.use-case";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";

describe("ForgotPinUseCase", () => {
  let userRepoMock: any;
  let mailServiceMock: any;
  let sessionCacheMock: any;
  let useCase: ForgotPinUseCase;

  const mockUser = new User({
    id: "user-forgot",
    name: Username.create("Abeja_Forgot"),
    age: 20,
    email: Email.create("forgot@wordhive.com"),
    pinHash: "hash",
    avatarUrl: null,
    isOnline: true,
    isGuest: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    userRepoMock = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      createPasswordReset: vi.fn().mockResolvedValue(undefined),
    };
    mailServiceMock = {
      sendOtpEmail: vi.fn().mockResolvedValue(undefined),
    };
    sessionCacheMock = {
      storeOtp: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new ForgotPinUseCase(userRepoMock, mailServiceMock, sessionCacheMock);
  });

  it("debe despachar OTP cuando el email está registrado", async () => {
    const result = await useCase.execute({ email: "forgot@wordhive.com" });

    expect(result.isSuccess).toBe(true);
    expect(sessionCacheMock.storeOtp).toHaveBeenCalledOnce();
    expect(userRepoMock.createPasswordReset).toHaveBeenCalledOnce();
  });

  it("debe retornar mensaje neutro sin error si el email no existe (anti-enumeration)", async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: "noexiste@wordhive.com" });

    expect(result.isSuccess).toBe(true);
    expect(sessionCacheMock.storeOtp).not.toHaveBeenCalled();
  });
});
