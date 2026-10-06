import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdatePinUseCase } from "../../../src/application/use-cases/update-pin.use-case";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";
import { InvalidCredentialsError } from "../../../src/domain/errors/auth.errors";

describe("UpdatePinUseCase", () => {
  let userRepoMock: any;
  let hashServiceMock: any;
  let mailServiceMock: any;
  let useCase: UpdatePinUseCase;

  const mockUser = new User({
    id: "user-789",
    name: Username.create("Abeja_Update"),
    age: 23,
    email: Email.create("update@wordhive.com"),
    pinHash: "hash_old",
    avatarUrl: null,
    isOnline: true,
    isGuest: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    userRepoMock = {
      findById: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(undefined),
    };
    hashServiceMock = {
      compare: vi.fn().mockResolvedValue(true),
      hash: vi.fn().mockResolvedValue("hash_new"),
    };
    mailServiceMock = {
      sendPinChangedAlert: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new UpdatePinUseCase(userRepoMock, hashServiceMock, mailServiceMock);
  });

  it("debe actualizar el PIN cuando el PIN actual es correcto", async () => {
    const result = await useCase.execute({
      userId: "user-789",
      currentPin: "1111",
      newPin: "2222",
    });

    expect(result.isSuccess).toBe(true);
    expect(mockUser.pinHash).toBe("hash_new");
    expect(userRepoMock.update).toHaveBeenCalledOnce();
  });

  it("debe fallar si el PIN actual no coincide", async () => {
    hashServiceMock.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      userId: "user-789",
      currentPin: "0000",
      newPin: "2222",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    }
  });
});
