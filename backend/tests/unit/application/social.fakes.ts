import { vi } from "vitest";
import { FriendRequest } from "../../../src/domain/entities/friend-request.entity";
import { Notification } from "../../../src/domain/entities/notification.entity";
import { FriendPair } from "../../../src/domain/value-objects/friend-pair.vo";
import { PublicPlayerProfile } from "../../../src/domain/repositories/friendship.repository.interface";

/** Fakes en memoria para probar el modulo social sin Prisma ni Redis. */
export type Profile = PublicPlayerProfile & { isGuest: boolean };

export const profile = (id: string, name = id, isGuest = false): Profile => ({ id, name, avatarUrl: "bee_scout", isGuest });

export function createSocialWorld(profiles: Profile[]) {
  const users = new Map(profiles.map((p) => [p.id, p]));
  const friendships = new Set<string>();
  const requests = new Map<string, FriendRequest>();
  const notifications: Notification[] = [];

  const friendshipRepo = {
    searchPlayers: vi.fn(async (term: string, exclude: string) =>
      [...users.values()].filter((u) => !u.isGuest && u.id !== exclude && u.name.toLowerCase().includes(term.toLowerCase()))
    ),
    findPublicProfile: vi.fn(async (id: string) => users.get(id) ?? null),
    areFriends: vi.fn(async (pair: FriendPair) => friendships.has(pair.key)),
    deleteFriendship: vi.fn(async (pair: FriendPair) => friendships.delete(pair.key)),
    listFriends: vi.fn(async (userId: string) =>
      [...friendships]
        .map((k) => k.split(":"))
        .filter(([a, b]) => a === userId || b === userId)
        .map(([a, b]) => ({ ...users.get(a === userId ? b : a)!, friendsSince: new Date(0) }))
    ),
    listFriendIds: vi.fn(async (userId: string) =>
      [...friendships].map((k) => k.split(":")).filter((p) => p.includes(userId)).map(([a, b]) => (a === userId ? b : a))
    ),
    getRelations: vi.fn(async () => new Map()),
  };

  const requestRepo = {
    findById: vi.fn(async (id: string) => requests.get(id) ?? null),
    findBetween: vi.fn(async (s: string, r: string) =>
      [...requests.values()].find((q) => q.senderId === s && q.recipientId === r) ?? null
    ),
    save: vi.fn(async (q: FriendRequest) => void requests.set(q.id, q)),
    delete: vi.fn(async (id: string) => void requests.delete(id)),
    deleteAllBetween: vi.fn(async () => undefined),
    acceptAndBefriend: vi.fn(async (q: FriendRequest) => {
      requests.set(q.id, q);
      friendships.add(q.pair.key);
    }),
    listIncoming: vi.fn(async () => []),
    listOutgoing: vi.fn(async () => []),
  };

  const notificationRepo = {
    create: vi.fn(async (n: Notification) => void notifications.push(n)),
    findById: vi.fn(async (id: string) => notifications.find((n) => n.id === id) ?? null),
    listForRecipient: vi.fn(async (r: string) => ({ items: notifications.filter((n) => n.recipientId === r), nextCursor: null })),
    countUnread: vi.fn(async (r: string) => notifications.filter((n) => n.recipientId === r && !n.isRead).length),
    markRead: vi.fn(async () => undefined),
    markAllRead: vi.fn(async () => 0),
  };

  const gateway = { emitToUser: vi.fn(), emitToUsers: vi.fn() };

  return { users, friendships, requests, notifications, friendshipRepo, requestRepo, notificationRepo, gateway };
}

export function befriend(world: ReturnType<typeof createSocialWorld>, a: string, b: string) {
  world.friendships.add(FriendPair.of(a, b).key);
}
