import { InvalidEmailFormatError } from "../errors/auth.errors";

/**
 * Value Object para Direccion de Correo Electronico.
 * Normaliza a minusculas y valida formato RFC.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawEmail: string): Email {
    if (!rawEmail || !Email.EMAIL_REGEX.test(rawEmail.trim())) {
      throw new InvalidEmailFormatError();
    }
    return new Email(rawEmail.trim().toLowerCase());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}
