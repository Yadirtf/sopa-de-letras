import { describe, it, expect } from "vitest";
import { Pin } from "../../../src/domain/value-objects/pin.vo";
import { InvalidPinFormatError } from "../../../src/domain/errors/auth.errors";

describe("Pin Value Object", () => {
  it("debe crear un PIN válido de 4 dígitos", () => {
    const pin = Pin.create("1234");
    expect(pin.value).toBe("1234");
  });

  it("debe rechazar un PIN con menos de 4 dígitos", () => {
    expect(() => Pin.create("123")).toThrowError(InvalidPinFormatError);
  });

  it("debe rechazar un PIN con más de 4 dígitos", () => {
    expect(() => Pin.create("12345")).toThrowError(InvalidPinFormatError);
  });

  it("debe rechazar un PIN con caracteres no numéricos", () => {
    expect(() => Pin.create("12a4")).toThrowError(InvalidPinFormatError);
  });

  it("debe comparar igualdad correctamente", () => {
    const pin1 = Pin.create("9876");
    const pin2 = Pin.create("9876");
    const pin3 = Pin.create("1111");

    expect(pin1.equals(pin2)).toBe(true);
    expect(pin1.equals(pin3)).toBe(false);
  });
});
