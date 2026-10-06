import { InvalidPinFormatError } from "../errors/auth.errors";

/**
 * Value Object para PIN numerico de 4 digitos.
 * Inmutable y auto-validado en construccion.
 */
export class Pin {
  private static readonly PIN_REGEX = /^\d{4}$/;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawPin: string): Pin {
    if (!rawPin || !Pin.PIN_REGEX.test(rawPin.trim())) {
      throw new InvalidPinFormatError();
    }
    return new Pin(rawPin.trim());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Pin): boolean {
    return this._value === other._value;
  }
}
