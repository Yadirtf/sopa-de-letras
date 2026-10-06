/**
 * Monada Result para manejo funcional y explicito de errores en Application Layer.
 */
export type Result<T, E = Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(readonly value: T) {}

  unwrap(): T {
    return this.value;
  }
}

export class Failure<T, E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(readonly error: E) {}

  unwrap(): never {
    throw this.error;
  }
}

export const ok = <T, E = Error>(value: T): Result<T, E> => new Success(value);
export const fail = <T = never, E = Error>(error: E): Result<T, E> => new Failure<T, E>(error);
