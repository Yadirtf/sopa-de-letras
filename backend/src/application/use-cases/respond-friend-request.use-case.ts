import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { IFriendRequestRepository } from "../../domain/repositories/friend-request.repository.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";
import { DomainError, UserNotFoundError } from "../../domain/errors/auth.errors";
import { FriendRequestNotFoundError } from "../../domain/errors/social.errors";
import { FriendshipAnnouncer } from "../services/friendship-announcer.service";
import { FriendRequestAction } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

/**
 * Responder una solicitud (US-22 / RF-27).
 * - ACCEPT (destinatario): crea la amistad y celebra con ambos.
 * - REJECT (destinatario): borra la solicitud en silencio; nadie recibe un "te rechazaron".
 * - CANCEL (remitente): retira la solicitud y refresca la bandeja del destinatario.
 */
export class RespondFriendRequestUseCase {
  constructor(
    private readonly friendships: IFriendshipRepository,
    private readonly requests: IFriendRequestRepository,
    private readonly announcer: FriendshipAnnouncer,
    private readonly gateway: IRealtimeGateway
  ) {}

  async execute(
    actorId: string,
    requestId: string,
    action: FriendRequestAction
  ): Promise<Result<{ status: "ACCEPTED" | "REMOVED" }, DomainError>> {
    try {
      const request = await this.requests.findById(requestId);
      if (!request) return fail(new FriendRequestNotFoundError());

      if (action === "ACCEPT") {
        request.accept(actorId);
        await this.requests.acceptAndBefriend(request);
        const [requester, acceptor] = await Promise.all([
          this.friendships.findPublicProfile(request.senderId),
          this.friendships.findPublicProfile(request.recipientId),
        ]);
        if (!requester || !acceptor) return fail(new UserNotFoundError());
        await this.announcer.announce(request.id, requester, acceptor);
        return ok({ status: "ACCEPTED" });
      }

      if (action === "REJECT") {
        request.reject(actorId);
      } else {
        request.assertCancellableBy(actorId);
        this.gateway.emitToUser(request.recipientId, "friendship:updated", { reason: "CANCELLED" });
      }
      await this.requests.delete(request.id);
      return ok({ status: "REMOVED" });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
