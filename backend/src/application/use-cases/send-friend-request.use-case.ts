import { v4 as uuidv4 } from "uuid";
import { FriendRequest } from "../../domain/entities/friend-request.entity";
import { FriendPair } from "../../domain/value-objects/friend-pair.vo";
import { IFriendshipRepository, PublicPlayerProfile } from "../../domain/repositories/friendship.repository.interface";
import { IFriendRequestRepository } from "../../domain/repositories/friend-request.repository.interface";
import { DomainError, UserNotFoundError } from "../../domain/errors/auth.errors";
import {
  AlreadyFriendsError,
  FriendRequestAlreadySentError,
  GuestSocialRestrictedError,
} from "../../domain/errors/social.errors";
import { NotificationDispatcher } from "../services/notification-dispatcher.service";
import { FriendshipAnnouncer } from "../services/friendship-announcer.service";
import { SendFriendRequestResultDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

/**
 * Enviar solicitud de amistad (US-22 / RF-26).
 *
 * Detalle de UX: si la otra persona YA nos habia enviado una solicitud,
 * pulsar "Agregar" la acepta al instante (amistad mutua). Nadie tiene
 * que entender por que "no puede" agregar a quien ya lo agrego.
 */
export class SendFriendRequestUseCase {
  constructor(
    private readonly friendships: IFriendshipRepository,
    private readonly requests: IFriendRequestRepository,
    private readonly dispatcher: NotificationDispatcher,
    private readonly announcer: FriendshipAnnouncer,
    private readonly idFactory: () => string = uuidv4
  ) {}

  async execute(senderId: string, recipientId: string): Promise<Result<SendFriendRequestResultDto, DomainError>> {
    try {
      const pair = FriendPair.of(senderId, recipientId);
      const [sender, recipient] = await this.loadParticipants(senderId, recipientId);

      if (await this.friendships.areFriends(pair)) return fail(new AlreadyFriendsError());

      const reverse = await this.requests.findBetween(recipientId, senderId);
      if (reverse?.isPending) {
        reverse.accept(senderId);
        await this.requests.acceptAndBefriend(reverse);
        await this.announcer.announce(reverse.id, recipient, sender);
        return ok({ requestId: reverse.id, status: "ACCEPTED" });
      }

      const existing = await this.requests.findBetween(senderId, recipientId);
      if (existing?.isPending) return fail(new FriendRequestAlreadySentError());

      const request = existing ?? FriendRequest.create(this.idFactory(), senderId, recipientId);
      if (existing) existing.reopen();
      await this.requests.save(request);

      await this.dispatcher.notify({
        recipientId,
        senderId,
        type: "FRIEND_REQUEST",
        payload: { requestId: request.id, fromUserId: sender.id, fromName: sender.name, fromAvatar: sender.avatarUrl },
      });
      return ok({ requestId: request.id, status: "PENDING" });
    } catch (error) {
      return fail(error as DomainError);
    }
  }

  private async loadParticipants(senderId: string, recipientId: string): Promise<[PublicPlayerProfile, PublicPlayerProfile]> {
    const [sender, recipient] = await Promise.all([
      this.friendships.findPublicProfile(senderId),
      this.friendships.findPublicProfile(recipientId),
    ]);
    if (!sender) throw new UserNotFoundError();
    if (sender.isGuest) throw new GuestSocialRestrictedError();
    if (!recipient || recipient.isGuest) throw new UserNotFoundError();
    return [this.toPublic(sender), this.toPublic(recipient)];
  }

  private toPublic(p: PublicPlayerProfile): PublicPlayerProfile {
    return { id: p.id, name: p.name, avatarUrl: p.avatarUrl };
  }
}
