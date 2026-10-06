import { describe, it, expect } from "vitest";
import { Username } from "../../../src/domain/value-objects/username.vo";
import { InvalidUsernameError } from "../../../src/domain/errors/auth.errors";

describe("Username Value Object", () => {
  it("debe crear un Username válido", () => {
    const user = Username.create("Abeja_Master");
    expect(user.value).toBe("Abeja_Master");
  });

  it("debe rechazar un username de menos de 3 caracteres", () => {
    expect(() => Username.create("ab")).toThrowError(InvalidUsernameError);
  });

  it("debe rechazar un username de más de 25 caracteres", () => {
    expect(() => Username.create("a".repeat(26))).toThrowError(InvalidUsernameError);
  });

  it("debe rechazar caracteres no permitidos", () => {
    expect(() => Username.create("User@#$")).toThrowError(InvalidUsernameError);
  });

  it("debe comparar igualdad insensible a mayúsculas", () => {
    const u1 = Username.create("PlayerOne");
    const u2 = Username.create("playerone");
    expect(u1.equals(u2)).toBe(true);
  });
});
