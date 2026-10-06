import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestLoginUseCase } from "../../../src/application/use-cases/guest-login.use-case";

describe("GuestLoginUseCase", () => {
  let userRepoMock: any;
  let hashServiceMock: any;
  let tokenServiceMock: any;
  let sessionCacheMock: any;
  let useCase: GuestLoginUseCase;

  beforeEach(() => {
    userRepoMock = { save: vi.fn().mockResolvedValue(undefined) };
    hashServiceMock = { hash: vi.fn().mockResolvedValue("dummy_pin_hash") };
    tokenServiceMock = {
      generateTokens: vi.fn().mockReturnValue({
        accessToken: "guest_jwt",
        refreshToken: "guest_refresh",
        expiresIn: 86400,
      }),
    };
    sessionCacheMock = { setSession: vi.fn().mockResolvedValue(undefined) };

    useCase = new GuestLoginUseCase(
      userRepoMock,
      hashServiceMock,
      tokenServiceMock,
      sessionCacheMock
    );
  });

  it("debe crear una sesión de invitado efímera válida", async () => {
    const result = await useCase.execute({});

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.user.isGuest).toBe(true);
      expect(result.value.user.name).toMatch(/^Abeja_\d{4}$/);
      expect(result.value.tokens.accessToken).toBe("guest_jwt");
    }
    expect(userRepoMock.save).toHaveBeenCalledOnce();
    expect(sessionCacheMock.setSession).toHaveBeenCalledOnce();
  });
});
