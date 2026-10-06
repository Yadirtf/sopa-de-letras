import { DomainError } from "./auth.errors";

export class WordSearchNotFoundError extends DomainError {
  readonly code = "WORD_SEARCH_NOT_FOUND";
  readonly statusCode = 404;

  constructor(id?: string) {
    super(id ? `Sopa de letras no encontrada (ID: ${id})` : "Sopa de letras no encontrada");
  }
}

export class InvalidCatalogQueryError extends DomainError {
  readonly code = "INVALID_CATALOG_QUERY";
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
