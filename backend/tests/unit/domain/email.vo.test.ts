import { describe, it, expect } from "vitest";
import { Email } from "../../../src/domain/value-objects/email.vo";
import { InvalidEmailFormatError } from "../../../src/domain/errors/auth.errors";

describe("Email Value Object", () => {
  it("debe crear un correo válido y normalizar a minúsculas", () => {
    const email = Email.create("Usuario@WordHive.COM");
    expect(email.value).toBe("usuario@wordhive.com");
  });

  it("debe rechazar un formato de email inválido", () => {
    expect(() => Email.create("invalido")).toThrowError(InvalidEmailFormatError);
    expect(() => Email.create("sin-arroba.com")).toThrowError(InvalidEmailFormatError);
    expect(() => Email.create("@nodominio.com")).toThrowError(InvalidEmailFormatError);
  });

  it("debe comparar correos ignorando mayúsculas", () => {
    const e1 = Email.create("test@hive.com");
    const e2 = Email.create("TEST@hive.com");
    expect(e1.equals(e2)).toBe(true);
  });
});
