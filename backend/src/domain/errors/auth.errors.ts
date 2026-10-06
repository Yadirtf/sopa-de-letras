/**
 * Errores de dominio para autenticacion y gestion de usuarios.
 * SSoT: Mensajes semanticos que no exponen vectores de ataque.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";
  readonly statusCode = 401;

  constructor() {
    super("Credenciales invalidas");
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = "USER_ALREADY_EXISTS";
  readonly statusCode = 409;

  constructor(field: "email" | "username") {
    super(`El ${field === "email" ? "correo electronico" : "nombre de usuario"} ya se encuentra registrado`);
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
  readonly statusCode = 404;

  constructor() {
    super("Usuario no encontrado");
  }
}

export class InvalidPinFormatError extends DomainError {
  readonly code = "INVALID_PIN_FORMAT";
  readonly statusCode = 400;

  constructor() {
    super("El PIN debe consistir exactamente de 4 digitos numericos");
  }
}

export class InvalidEmailFormatError extends DomainError {
  readonly code = "INVALID_EMAIL_FORMAT";
  readonly statusCode = 400;

  constructor() {
    super("El formato del correo electronico no es valido");
  }
}

export class InvalidUsernameError extends DomainError {
  readonly code = "INVALID_USERNAME";
  readonly statusCode = 400;

  constructor(reason: string) {
    super(`Nombre de usuario invalido: ${reason}`);
  }
}

export class InvalidOtpError extends DomainError {
  readonly code = "INVALID_OTP";
  readonly statusCode = 400;

  constructor() {
    super("Codigo de verificacion incorrecto o expirado");
  }
}

export class RateLimitExceededError extends DomainError {
  readonly code = "RATE_LIMIT_EXCEEDED";
  readonly statusCode = 429;

  constructor() {
    super("Demasiados intentos fallidos. Por seguridad, intente nuevamente en 15 minutos");
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;

  constructor(message = "Sesion invalida o expirada") {
    super(message);
  }
}

/** PIN actual equivocado al cambiarlo. 400 y no 401: la sesion sigue siendo valida. */
export class WrongCurrentPinError extends DomainError {
  readonly code = "WRONG_CURRENT_PIN";
  readonly statusCode = 400;

  constructor() {
    super("El PIN actual no es correcto");
  }
}

export class SamePinError extends DomainError {
  readonly code = "SAME_PIN";
  readonly statusCode = 400;

  constructor() {
    super("El nuevo PIN debe ser diferente al actual");
  }
}

export class GuestNotAllowedError extends DomainError {
  readonly code = "GUEST_NOT_ALLOWED";
  readonly statusCode = 403;

  constructor(action: string) {
    super(`Las cuentas de invitado no pueden ${action}. Completa tu registro primero`);
  }
}
