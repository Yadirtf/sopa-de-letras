import { FriendPair } from "../../domain/value-objects/friend-pair.vo";
import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { IRoomStateReader, LiveRoomSnapshot } from "../../domain/services/room-state-reader.interface";
import { ICooldownStore } from "../../domain/services/cooldown.service.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";
import { DomainError, UserNotFoundError } from "../../domain/errors/auth.errors";
import {
  InviteCooldownError,
  NotFriendsError,
  RoomNotJoinableError,
  SocialActionForbiddenError,
} from "../../domain/errors/social.errors";
import { NotificationDispatcher } from "../services/notification-dispatcher.service";
import { RoomInviteResultDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

/** Lo que dura el banner de invitacion en la pantalla del amigo (US-24). */
export const INVITE_TTL_SECONDS = 15;

/**
 * Invitar a un amigo a la sala actual con un toque (US-24 / RF-29).
 * Envia `room:invite_received` al canal privado `user:{friendId}` y deja
 * rastro en el centro de notificaciones por si el amigo no estaba mirando.
 */
export class InviteFriendToRoomUseCase {
  constructor(
    private readonly friendships: IFriendshipRepository,
    private readonly rooms: IRoomStateReader,
    private readonly cooldown: ICooldownStore,
    private readonly dispatcher: NotificationDispatcher,
    private readonly gateway: IRealtimeGateway,
    private readonly clock: () => number = Date.now
  ) {}

  async execute(inviterId: string, friendId: string, rawRoomCode: string): Promise<Result<RoomInviteResultDto, DomainError>> {
    try {
      const pair = FriendPair.of(inviterId, friendId);
      if (!(await this.friendships.areFriends(pair))) return fail(new NotFriendsError());

      const roomCode = (rawRoomCode ?? "").trim().toUpperCase();
      const room = await this.rooms.getRoom(roomCode);
      this.assertInvitable(room, inviterId, friendId);

      const cooldownKey = `invite:cooldown:${roomCode}:${friendId}`;
      if (!(await this.cooldown.tryAcquire(cooldownKey, INVITE_TTL_SECONDS))) {
        return fail(new InviteCooldownError());
      }

      const inviter = await this.friendships.findPublicProfile(inviterId);
      if (!inviter) return fail(new UserNotFoundError());

      const expiresAt = this.clock() + INVITE_TTL_SECONDS * 1000;
      const payload = {
        roomCode,
        wordSearchTitle: room!.wordSearchTitle,
        fromUserId: inviter.id,
        fromName: inviter.name,
        fromAvatar: inviter.avatarUrl,
        playersCount: room!.players.length,
        expiresAt,
      };

      const notification = await this.dispatcher.notify({
        recipientId: friendId,
        senderId: inviterId,
        type: "ROOM_INVITE",
        payload,
      });
      this.gateway.emitToUser(friendId, "room:invite_received", { ...payload, notificationId: notification?.id ?? null });

      return ok({ invitedUserId: friendId, expiresAt });
    } catch (error) {
      return fail(error as DomainError);
    }
  }

  private assertInvitable(room: LiveRoomSnapshot | null, inviterId: string, friendId: string): void {
    if (!room) throw new RoomNotJoinableError("Esta sala ya no existe");
    if (!room.players.some((p) => p.userId === inviterId)) {
      throw new SocialActionForbiddenError("Entra a la sala antes de invitar amigos");
    }
    if (room.players.some((p) => p.userId === friendId)) {
      throw new RoomNotJoinableError("Tu amigo ya esta en la sala");
    }
    if (room.status !== "WAITING") throw new RoomNotJoinableError("La partida ya empezo");
    if (room.players.length >= room.maxPlayers) throw new RoomNotJoinableError("La sala esta llena");
  }
}
