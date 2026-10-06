import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResetPinUseCase } from "../../../src/application/use-cases/reset-pin.use-case";
import { InvalidOtpError } from "../../../src/domain/errors/auth.errors";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";

describe("ResetPinUseCase", () => {
  let userRepoMock: any;
  let hashServiceMock: any;
  let mailServiceMock: any;
  let sessionCacheMock: any;
  let useCase: ResetPinUseCase;

  const mockUser = new User({
    id: "user-456",
    name: Username.create("Abeja_Reset"),
    age: 21,
    email: Email.create("reset@wordhive.com"),
    pinHash: "old_pin_hash",
    avatarUrl: null,
    isOnline: true,
    isGuest: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    userRepoMock = {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findPasswordResetByOtp: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(undefined),
      invalidatePasswordResets: vi.fn().mockResolvedValue(undefined),
    };
    hashServiceMock = {
      hash: vi.fn().mockResolvedValue("new_hashed_pin"),
    };
    mailServiceMock = {
      sendPinChangedAlert: vi.fn().mockResolvedValue(undefined),
    };
    sessionCacheMock = {
      getOtp: vi.fn().mockResolvedValue("123456"),
      deleteOtp: vi.fn().mockResolvedValue(undefined),
      deleteSession: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new ResetPinUseCase(
      userRepoMock,
      hashServiceMock,
      mailServiceMock,
      sessionCacheMock
    );
  });

  it("debe restablecer el PIN cuando el OTP coincide", async () => {
    const result = await useCase.execute({
      email: "reset@wordhive.com",
      otpCode: "123456",
      newPin: "7777",
    });

    expect(result.isSuccess).toBe(true);
    expect(mockUser.pinHash).toBe("new_hashed_pin");
    expect(sessionCacheMock.deleteOtp).toHaveBeenCalledWith("reset@wordhive.com");
    expect(sessionCacheMock.deleteSession).toHaveBeenCalledWith("user-456");
  });

  it("debe rechazar cuando el OTP es incorrecto", async () => {
    sessionCacheMock.getOtp.mockResolvedValue("654321");

    const result = await useCase.execute({
      email: "reset@wordhive.com",
      otpCode: "000000",
      newPin: "7777",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(InvalidOtpError);
    }
  });
});
