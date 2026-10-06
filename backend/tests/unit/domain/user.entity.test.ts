import { describe, it, expect } from "vitest";
import { User } from "../../../src/domain/entities/user.entity";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { Username } from "../../../src/domain/value-objects/username.vo";

describe("User Domain Entity", () => {
  it("debe instanciar y mutar correctamente las propiedades de usuario", () => {
    const user = new User({
      id: "uuid-123",
      name: Username.create("Abeja_Inicial"),
      age: 20,
      email: Email.create("test@wordhive.com"),
      pinHash: "hash123",
      avatarUrl: null,
      isOnline: false,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(user.isOnline).toBe(false);
    user.setOnlineStatus(true);
    expect(user.isOnline).toBe(true);

    user.updateProfile(Username.create("Abeja_Mutada"), "bee_queen");
    expect(user.name.value).toBe("Abeja_Mutada");
    expect(user.avatarUrl).toBe("bee_queen");

    user.updatePinHash("new_hash_456");
    expect(user.pinHash).toBe("new_hash_456");
  });

  it("debe transformar un usuario invitado a permanente", () => {
    const guestUser = new User({
      id: "uuid-guest",
      name: Username.create("Abeja_Guest"),
      age: 18,
      email: Email.create("guest@wordhive.local"),
      pinHash: "dummy_hash",
      avatarUrl: null,
      isOnline: true,
      isGuest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(guestUser.isGuest).toBe(true);

    guestUser.upgradeFromGuest(
      Username.create("Abeja_Permanente"),
      Email.create("permanente@wordhive.com"),
      "secure_hash"
    );

    expect(guestUser.isGuest).toBe(false);
    expect(guestUser.name.value).toBe("Abeja_Permanente");
    expect(guestUser.email.value).toBe("permanente@wordhive.com");
  });
});
