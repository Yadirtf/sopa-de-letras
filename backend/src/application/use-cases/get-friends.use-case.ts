import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { IPresenceStore, PresenceStatus } from "../../domain/services/presence.service.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { FriendDto, FriendListDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

// Quien esta disponible para jugar va arriba: es la pregunta que el jugador trae al abrir la lista.
const STATUS_WEIGHT: Record<PresenceStatus, number> = { ONLINE: 0, PLAYING: 1, OFFLINE: 2 };

/**
 * Lista de amigos con presencia en tiempo real (US-23 / RF-28).
 */
export class GetFriendsUseCase {
  constructor(
    private readonly friendships: IFriendshipRepository,
    private readonly presence: IPresenceStore
  ) {}

  async execute(userId: string): Promise<Result<FriendListDto, DomainError>> {
    try {
      const records = await this.friendships.listFriends(userId);
      const presence = await this.presence.getMany(records.map((r) => r.id));

      const friends: FriendDto[] = records.map((r) => ({
        id: r.id,
        name: r.name,
        avatarUrl: r.avatarUrl,
        friendsSince: r.friendsSince.toISOString(),
        status: presence.get(r.id)?.status ?? "OFFLINE",
      }));

      friends.sort(
        (a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status] || a.name.localeCompare(b.name, "es")
      );

      const onlineCount = friends.filter((f) => f.status !== "OFFLINE").length;
      return ok({ friends, onlineCount });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
