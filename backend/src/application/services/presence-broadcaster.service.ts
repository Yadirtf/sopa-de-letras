import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { IPresenceStore, PresenceStatus } from "../../domain/services/presence.service.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";

/**
 * Traduce eventos de conexion/sala en cambios de presencia y los difunde
 * SOLO a los amigos del jugador (evento `friend:presence`), nunca a toda la app.
 *
 * El codigo de sala no viaja a los amigos: una sala privada no debe
 * filtrarse por la lista de amigos. Para entrar, hace falta una invitacion.
 */
export class PresenceBroadcaster {
  constructor(
    private readonly presence: IPresenceStore,
    private readonly friendships: IFriendshipRepository,
    private readonly gateway: IRealtimeGateway
  ) {}

  async connected(userId: string): Promise<void> {
    await this.presence.markOnline(userId);
    await this.broadcast(userId, "ONLINE");
  }

  async heartbeat(userId: string): Promise<void> {
    const stillAlive = await this.presence.heartbeat(userId);
    if (!stillAlive) await this.connected(userId);
  }

  async joinedRoom(userId: string, roomCode: string): Promise<void> {
    if (await this.presence.markPlaying(userId, roomCode)) {
      await this.broadcast(userId, "PLAYING");
    }
  }

  async leftRoom(userId: string): Promise<void> {
    if (await this.presence.markBackOnline(userId)) {
      await this.broadcast(userId, "ONLINE");
    }
  }

  async disconnected(userId: string): Promise<void> {
    await this.presence.markOffline(userId);
    await this.broadcast(userId, "OFFLINE");
  }

  private async broadcast(userId: string, status: PresenceStatus): Promise<void> {
    try {
      const friendIds = await this.friendships.listFriendIds(userId);
      if (friendIds.length === 0) return;
      this.gateway.emitToUsers(friendIds, "friend:presence", { userId, status });
    } catch (err) {
      console.warn("[PresenceBroadcaster] Difusion fallida:", (err as Error).message);
    }
  }
}
