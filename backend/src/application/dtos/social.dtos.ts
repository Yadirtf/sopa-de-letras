import { Notification, NotificationType } from "../../domain/entities/notification.entity";
import { PublicPlayerProfile, RelationStatus } from "../../domain/repositories/friendship.repository.interface";
import { PresenceStatus } from "../../domain/services/presence.service.interface";

export type FriendRequestAction = "ACCEPT" | "REJECT" | "CANCEL";

export interface PlayerSearchResultDto extends PublicPlayerProfile {
  relation: RelationStatus;
}

export interface FriendDto extends PublicPlayerProfile {
  status: PresenceStatus;
  friendsSince: string;
}

export interface FriendListDto {
  friends: FriendDto[];
  onlineCount: number;
}

export interface FriendRequestDto {
  id: string;
  createdAt: string;
  player: PublicPlayerProfile;
}

export interface FriendRequestsDto {
  incoming: FriendRequestDto[];
  outgoing: FriendRequestDto[];
}

export interface SendFriendRequestResultDto {
  requestId: string;
  /** ACCEPTED cuando la otra persona ya nos habia enviado solicitud (amistad mutua instantanea). */
  status: "PENDING" | "ACCEPTED";
}

export interface RoomInviteResultDto {
  invitedUserId: string;
  expiresAt: number;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListDto {
  items: NotificationDto[];
  nextCursor: string | null;
  unreadCount: number;
}

export function toNotificationDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    type: notification.type,
    payload: notification.payload,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}
