import { PrismaClient } from "@prisma/client";
import { FriendPair } from "../../../domain/value-objects/friend-pair.vo";
import {
  FriendRecord,
  IFriendshipRepository,
  PublicPlayerProfile,
  RelationStatus,
} from "../../../domain/repositories/friendship.repository.interface";

const PUBLIC_FIELDS = { id: true, name: true, avatarUrl: true } as const;

export class PrismaFriendshipRepository implements IFriendshipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async searchPlayers(term: string, excludeUserId: string, limit: number): Promise<PublicPlayerProfile[]> {
    return this.prisma.user.findMany({
      where: { name: { contains: term, mode: "insensitive" }, isGuest: false, id: { not: excludeUserId } },
      select: PUBLIC_FIELDS,
      orderBy: { name: "asc" },
      take: limit,
    });
  }

  async findPublicProfile(userId: string): Promise<(PublicPlayerProfile & { isGuest: boolean }) | null> {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { ...PUBLIC_FIELDS, isGuest: true } });
  }

  async areFriends(pair: FriendPair): Promise<boolean> {
    const row = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: { userAId: pair.userAId, userBId: pair.userBId } },
      select: { id: true },
    });
    return row !== null;
  }

  async deleteFriendship(pair: FriendPair): Promise<boolean> {
    const { count } = await this.prisma.friendship.deleteMany({
      where: { userAId: pair.userAId, userBId: pair.userBId },
    });
    return count > 0;
  }

  async listFriends(userId: string): Promise<FriendRecord[]> {
    const rows = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: { userA: { select: PUBLIC_FIELDS }, userB: { select: PUBLIC_FIELDS } },
    });
    return rows.map((row) => {
      const friend = row.userAId === userId ? row.userB : row.userA;
      return { ...friend, friendsSince: row.createdAt };
    });
  }

  async listFriendIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    });
    return rows.map((row) => (row.userAId === userId ? row.userBId : row.userAId));
  }

  async getRelations(userId: string, otherIds: string[]): Promise<Map<string, RelationStatus>> {
    const relations = new Map<string, RelationStatus>();
    if (otherIds.length === 0) return relations;

    const [friendships, requests] = await Promise.all([
      this.prisma.friendship.findMany({
        where: {
          OR: [
            { userAId: userId, userBId: { in: otherIds } },
            { userBId: userId, userAId: { in: otherIds } },
          ],
        },
        select: { userAId: true, userBId: true },
      }),
      this.prisma.friendRequest.findMany({
        where: {
          status: "PENDING",
          OR: [
            { senderId: userId, recipientId: { in: otherIds } },
            { recipientId: userId, senderId: { in: otherIds } },
          ],
        },
        select: { senderId: true, recipientId: true },
      }),
    ]);

    for (const r of requests) {
      if (r.senderId === userId) relations.set(r.recipientId, "REQUEST_SENT");
      else relations.set(r.senderId, "REQUEST_RECEIVED");
    }
    // La amistad gana sobre cualquier solicitud residual.
    for (const f of friendships) relations.set(f.userAId === userId ? f.userBId : f.userAId, "FRIENDS");
    return relations;
  }
}
