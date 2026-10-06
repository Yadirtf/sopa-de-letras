import { InvalidUsernameError } from "../errors/auth.errors";

/**
 * Value Object para Nombre de Usuario / Display Name.
 * Minimo 3 caracteres, maximo 25, letras (con tildes y ñ), numeros, guiones o espacios.
 */
export class Username {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 25;
  private static readonly USERNAME_REGEX = /^[\p{L}\p{N}_ -]+$/u;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawUsername: string): Username {
    const trimmed = rawUsername?.trim() ?? "";
    if (trimmed.length < Username.MIN_LENGTH) {
      throw new InvalidUsernameError(`Debe contener al menos ${Username.MIN_LENGTH} caracteres`);
    }
    if (trimmed.length > Username.MAX_LENGTH) {
      throw new InvalidUsernameError(`No puede superar ${Username.MAX_LENGTH} caracteres`);
    }
    if (!Username.USERNAME_REGEX.test(trimmed)) {
      throw new InvalidUsernameError("Solo letras, numeros, guiones o espacios");
    }
    return new Username(trimmed);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Username): boolean {
    return this._value.toLowerCase() === other._value.toLowerCase();
  }
}
