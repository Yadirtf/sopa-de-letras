import { DomainError } from "./auth.errors";

export class WordSearchGenerationFailedError extends DomainError {
  readonly code = "WORD_SEARCH_GENERATION_FAILED";
  readonly statusCode = 422;

  constructor(reason = "No fue posible ubicar todas las palabras en la cuadrícula especificada tras 100 intentos. Sugerencia: aumenta las dimensiones de la cuadrícula o reduce la cantidad de palabras.") {
    super(reason);
  }
}

export class UnauthorizedWordSearchAccessError extends DomainError {
  readonly code = "UNAUTHORIZED_WORD_SEARCH_ACCESS";
  readonly statusCode = 403;

  constructor() {
    super("No tienes permisos para modificar o eliminar esta sopa de letras");
  }
}

export class WordSearchHasActiveRoomsError extends DomainError {
  readonly code = "WORD_SEARCH_HAS_ACTIVE_ROOMS";
  readonly statusCode = 409;

  constructor() {
    super("La sopa de letras no puede ser eliminada porque tiene partidas o salas activas");
  }
}

export class InvalidWordListError extends DomainError {
  readonly code = "INVALID_WORD_LIST";
  readonly statusCode = 400;

  constructor(reason: string) {
    super(`Lista de palabras inválida: ${reason}`);
  }
}

export class UnexpectedWordSearchError extends DomainError {
  readonly code = "UNEXPECTED_WORD_SEARCH_ERROR";
  readonly statusCode = 500;

  constructor(message = "Error inesperado al procesar la sopa de letras") {
    super(message);
  }
}

