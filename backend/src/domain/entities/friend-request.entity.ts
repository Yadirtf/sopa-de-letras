import {
  FriendRequestNotPendingError,
  SocialActionForbiddenError,
} from "../errors/social.errors";
import { FriendPair } from "../value-objects/friend-pair.vo";

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendRequestProps {
  id: string;
  senderId: string;
  recipientId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Solicitud de amistad como pequena maquina de estados:
 *   PENDING --accept(recipient)--> ACCEPTED
 *   PENDING --reject(recipient)--> REJECTED
 *   PENDING --cancel(sender)-----> (se elimina; no hay estado CANCELLED en BD)
 * Cualquier otra transicion es un error de dominio.
 */
export class FriendRequest {
  private constructor(private props: FriendRequestProps) {}

  public static create(id: string, senderId: string, recipientId: string): FriendRequest {
    FriendPair.of(senderId, recipientId); // valida que no sea uno mismo
    const now = new Date();
    return new FriendRequest({ id, senderId, recipientId, status: "PENDING", createdAt: now, updatedAt: now });
  }

  public static restore(props: FriendRequestProps): FriendRequest {
    return new FriendRequest({ ...props });
  }

  public get id(): string { return this.props.id; }
  public get senderId(): string { return this.props.senderId; }
  public get recipientId(): string { return this.props.recipientId; }
  public get status(): FriendRequestStatus { return this.props.status; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }
  public get isPending(): boolean { return this.props.status === "PENDING"; }
  public get pair(): FriendPair { return FriendPair.of(this.props.senderId, this.props.recipientId); }

  public accept(actorId: string): void {
    this.assertRecipient(actorId);
    this.transitionTo("ACCEPTED");
  }

  public reject(actorId: string): void {
    this.assertRecipient(actorId);
    this.transitionTo("REJECTED");
  }

  /** El remitente se arrepiente antes de que respondan. */
  public assertCancellableBy(actorId: string): void {
    if (actorId !== this.props.senderId) {
      throw new SocialActionForbiddenError("Solo quien envio la solicitud puede cancelarla");
    }
    this.assertPending();
  }

  /** Reutiliza una solicitud antigua (rechazada o de una amistad terminada). */
  public reopen(): void {
    this.props.status = "PENDING";
    this.props.updatedAt = new Date();
  }

  private assertRecipient(actorId: string): void {
    if (actorId !== this.props.recipientId) {
      throw new SocialActionForbiddenError("Solo quien recibio la solicitud puede responderla");
    }
  }

  private assertPending(): void {
    if (!this.isPending) throw new FriendRequestNotPendingError();
  }

  private transitionTo(status: FriendRequestStatus): void {
    this.assertPending();
    this.props.status = status;
    this.props.updatedAt = new Date();
  }
}
