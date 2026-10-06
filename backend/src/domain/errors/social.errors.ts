import { DomainError } from "./auth.errors";

/**
 * Errores del ecosistema social (EP-05).
 * Los mensajes estan pensados para mostrarse tal cual en la app:
 * cortos, amables y comprensibles para jugadores de cualquier edad.
 */

export class CannotFriendYourselfError extends DomainError {
  readonly code = "CANNOT_FRIEND_YOURSELF";
  readonly statusCode = 400;
  constructor() {
    super("¡Ya eres tu mejor amigo! Busca a otra persona para agregar");
  }
}

export class GuestSocialRestrictedError extends DomainError {
  readonly code = "GUEST_SOCIAL_RESTRICTED";
  readonly statusCode = 403;
  constructor() {
    super("Crea una cuenta gratis para tener amigos e invitarlos a jugar");
  }
}

export class AlreadyFriendsError extends DomainError {
  readonly code = "ALREADY_FRIENDS";
  readonly statusCode = 409;
  constructor() {
    super("Ya son amigos");
  }
}

export class FriendRequestAlreadySentError extends DomainError {
  readonly code = "FRIEND_REQUEST_ALREADY_SENT";
  readonly statusCode = 409;
  constructor() {
    super("Ya le enviaste una solicitud. ¡Espera a que responda!");
  }
}

export class FriendRequestNotFoundError extends DomainError {
  readonly code = "FRIEND_REQUEST_NOT_FOUND";
  readonly statusCode = 404;
  constructor() {
    super("Esta solicitud ya no existe");
  }
}

export class FriendRequestNotPendingError extends DomainError {
  readonly code = "FRIEND_REQUEST_NOT_PENDING";
  readonly statusCode = 409;
  constructor() {
    super("Esta solicitud ya fue respondida");
  }
}

export class SocialActionForbiddenError extends DomainError {
  readonly code = "SOCIAL_ACTION_FORBIDDEN";
  readonly statusCode = 403;
  constructor(message = "No puedes realizar esta accion") {
    super(message);
  }
}

export class NotFriendsError extends DomainError {
  readonly code = "NOT_FRIENDS";
  readonly statusCode = 403;
  constructor(message = "Solo puedes invitar a tus amigos") {
    super(message);
  }
}

export class RoomNotJoinableError extends DomainError {
  readonly code = "ROOM_NOT_JOINABLE";
  readonly statusCode = 409;
  constructor(reason: string) {
    super(reason);
  }
}

export class InviteCooldownError extends DomainError {
  readonly code = "INVITE_COOLDOWN";
  readonly statusCode = 429;
  constructor() {
    super("Ya lo invitaste. Dale unos segundos para responder");
  }
}

export class NotificationNotFoundError extends DomainError {
  readonly code = "NOTIFICATION_NOT_FOUND";
  readonly statusCode = 404;
  constructor() {
    super("Notificacion no encontrada");
  }
}
