import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { ITokenService } from "../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { IRoomStateReader } from "../../domain/services/room-state-reader.interface";
import { PrismaFriendshipRepository } from "../../infrastructure/database/repositories/prisma-friendship.repository";
import { PrismaFriendRequestRepository } from "../../infrastructure/database/repositories/prisma-friend-request.repository";
import { PrismaNotificationRepository } from "../../infrastructure/database/repositories/prisma-notification.repository";
import { RedisPresenceCache } from "../../infrastructure/cache/redis-presence.cache";
import { RedisCooldownCache } from "../../infrastructure/cache/redis-cooldown.cache";
import { SocketIoRealtimeGateway } from "../../infrastructure/websocket/socket-io-realtime.gateway";
import { PresenceEventsHandler } from "../../infrastructure/websocket/handlers/presence-events.handler";
import { RoomLifecycleListener } from "../../infrastructure/websocket/handlers/room-events.handler";
import { NotificationDispatcher } from "../../application/services/notification-dispatcher.service";
import { FriendshipAnnouncer } from "../../application/services/friendship-announcer.service";
import { PresenceBroadcaster } from "../../application/services/presence-broadcaster.service";
import { SearchPlayersUseCase } from "../../application/use-cases/search-players.use-case";
import { SendFriendRequestUseCase } from "../../application/use-cases/send-friend-request.use-case";
import { RespondFriendRequestUseCase } from "../../application/use-cases/respond-friend-request.use-case";
import { GetFriendsUseCase } from "../../application/use-cases/get-friends.use-case";
import { GetFriendRequestsUseCase } from "../../application/use-cases/get-friend-requests.use-case";
import { RemoveFriendUseCase } from "../../application/use-cases/remove-friend.use-case";
import { InviteFriendToRoomUseCase } from "../../application/use-cases/invite-friend-to-room.use-case";
import { ListNotificationsUseCase } from "../../application/use-cases/list-notifications.use-case";
import { MarkNotificationsReadUseCase } from "../../application/use-cases/mark-notifications-read.use-case";
import { FriendsController } from "../http/controllers/friends.controller";
import { NotificationsController } from "../http/controllers/notifications.controller";

export interface SocialContainerDeps {
  prisma: PrismaClient;
  redis: Redis;
  tokenService: ITokenService;
  sessionCache: ISessionCacheService;
}

/**
 * Composicion del Ecosistema Social (EP-05).
 * Se construye en dos tiempos: primero todo lo HTTP, y `bindRoomReader`
 * cuando ya existe la cache de salas (la crea el contenedor de EP-04).
 */
export function createSocialContainer(deps: SocialContainerDeps) {
  const friendships = new PrismaFriendshipRepository(deps.prisma);
  const requests = new PrismaFriendRequestRepository(deps.prisma);
  const notifications = new PrismaNotificationRepository(deps.prisma);
  const presence = new RedisPresenceCache(deps.redis);
  const cooldown = new RedisCooldownCache(deps.redis);
  const gateway = new SocketIoRealtimeGateway();

  const dispatcher = new NotificationDispatcher(notifications, gateway);
  const announcer = new FriendshipAnnouncer(dispatcher, gateway);
  const broadcaster = new PresenceBroadcaster(presence, friendships, gateway);

  let roomReader: IRoomStateReader | null = null;
  const lazyRoomReader: IRoomStateReader = {
    getRoom: (code) => (roomReader ? roomReader.getRoom(code) : Promise.resolve(null)),
  };

  const friendsController = new FriendsController({
    search: new SearchPlayersUseCase(friendships),
    sendRequest: new SendFriendRequestUseCase(friendships, requests, dispatcher, announcer),
    respondRequest: new RespondFriendRequestUseCase(friendships, requests, announcer, gateway),
    getFriends: new GetFriendsUseCase(friendships, presence),
    getRequests: new GetFriendRequestsUseCase(requests),
    removeFriend: new RemoveFriendUseCase(friendships, requests, gateway),
    inviteToRoom: new InviteFriendToRoomUseCase(friendships, lazyRoomReader, cooldown, dispatcher, gateway),
  });
  const notificationsController = new NotificationsController(
    new ListNotificationsUseCase(notifications),
    new MarkNotificationsReadUseCase(notifications)
  );

  const roomLifecycle: RoomLifecycleListener = {
    onPlayerJoined: (userId, roomCode) => void broadcaster.joinedRoom(userId, roomCode).catch(() => undefined),
    onPlayerLeft: (userId) => void broadcaster.leftRoom(userId).catch(() => undefined),
  };

  return {
    friendsController,
    notificationsController,
    dispatcher,
    socketBindings: {
      presenceHandler: new PresenceEventsHandler(deps.tokenService, deps.sessionCache, broadcaster),
      roomLifecycle,
      onServerReady: gateway.attach.bind(gateway),
    },
    bindRoomReader: (reader: IRoomStateReader) => {
      roomReader = reader;
    },
  };
}

export type SocialContainer = ReturnType<typeof createSocialContainer>;
