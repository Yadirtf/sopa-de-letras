import { PublicPlayerProfile } from "../../domain/repositories/friendship.repository.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";
import { NotificationDispatcher } from "./notification-dispatcher.service";

/**
 * Celebra una amistad nueva: avisa a quien envio la solicitud y pide a
 * ambas apps refrescar sus listas. Compartido por "aceptar" y por la
 * amistad mutua instantanea, para que ambos caminos se sientan identicos.
 */
export class FriendshipAnnouncer {
  constructor(
    private readonly dispatcher: NotificationDispatcher,
    private readonly gateway: IRealtimeGateway
  ) {}

  async announce(requestId: string, requester: PublicPlayerProfile, acceptor: PublicPlayerProfile): Promise<void> {
    await this.dispatcher.notify({
      recipientId: requester.id,
      senderId: acceptor.id,
      type: "FRIEND_ACCEPTED",
      payload: {
        requestId,
        friendId: acceptor.id,
        friendName: acceptor.name,
        friendAvatar: acceptor.avatarUrl,
      },
    });
    this.gateway.emitToUsers([requester.id, acceptor.id], "friendship:updated", {
      reason: "ACCEPTED",
      userIds: [requester.id, acceptor.id],
    });
  }
}
