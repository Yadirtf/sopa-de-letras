import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProfileUseCase } from "../../../src/application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../../src/application/use-cases/update-profile.use-case";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";

describe("Profile Use Cases", () => {
  let userRepoMock: any;
  let getProfileUseCase: GetProfileUseCase;
  let updateProfileUseCase: UpdateProfileUseCase;

  const mockUser = new User({
    id: "user-profile",
    name: Username.create("Abeja_Profile"),
    age: 19,
    email: Email.create("profile@wordhive.com"),
    pinHash: "hash",
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
    getProfileUseCase = new GetProfileUseCase(userRepoMock);
    updateProfileUseCase = new UpdateProfileUseCase(userRepoMock);
  });

  it("debe obtener el perfil del usuario autenticado", async () => {
    const result = await getProfileUseCase.execute("user-profile");
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.id).toBe("user-profile");
      expect(result.value.name).toBe("Abeja_Profile");
    }
  });

  it("debe actualizar el nombre y el avatar", async () => {
    const result = await updateProfileUseCase.execute({
      userId: "user-profile",
      name: "Abeja_Nueva",
      avatarUrl: "bee_queen",
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.name).toBe("Abeja_Nueva");
      expect(result.value.avatarUrl).toBe("bee_queen");
    }
    expect(userRepoMock.update).toHaveBeenCalledOnce();
  });
});
