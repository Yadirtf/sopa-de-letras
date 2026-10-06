import { FriendPair } from "../../domain/value-objects/friend-pair.vo";
import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { IFriendRequestRepository } from "../../domain/repositories/friend-request.repository.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { NotFriendsError } from "../../domain/errors/social.errors";
import { Result, ok, fail } from "../common/result";

/**
 * Eliminar amistad. Tambien limpia solicitudes historicas entre ambos
 * para que puedan volver a agregarse en el futuro sin bloqueos.
 */
export class RemoveFriendUseCase {
  constructor(
    private readonly friendships: IFriendshipRepository,
    private readonly requests: IFriendRequestRepository,
    private readonly gateway: IRealtimeGateway
  ) {}

  async execute(userId: string, friendId: string): Promise<Result<{ removed: true }, DomainError>> {
    try {
      const pair = FriendPair.of(userId, friendId);
      const removed = await this.friendships.deleteFriendship(pair);
      if (!removed) return fail(new NotFriendsError("Ustedes no son amigos"));

      await this.requests.deleteAllBetween(userId, friendId);
      this.gateway.emitToUser(friendId, "friendship:updated", { reason: "REMOVED" });
      return ok({ removed: true });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
