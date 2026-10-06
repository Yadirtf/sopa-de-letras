import { PrismaClient } from "@prisma/client";
import { FriendRequest } from "../../../domain/entities/friend-request.entity";
import {
  FriendRequestView,
  IFriendRequestRepository,
} from "../../../domain/repositories/friend-request.repository.interface";

const PUBLIC_FIELDS = { id: true, name: true, avatarUrl: true } as const;

export class PrismaFriendRequestRepository implements IFriendRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<FriendRequest | null> {
    const raw = await this.prisma.friendRequest.findUnique({ where: { id } });
    return raw ? FriendRequest.restore(raw) : null;
  }

  async findBetween(senderId: string, recipientId: string): Promise<FriendRequest | null> {
    const raw = await this.prisma.friendRequest.findUnique({
      where: { senderId_recipientId: { senderId, recipientId } },
    });
    return raw ? FriendRequest.restore(raw) : null;
  }

  async save(request: FriendRequest): Promise<void> {
    await this.prisma.friendRequest.upsert({
      where: { id: request.id },
      create: {
        id: request.id,
        senderId: request.senderId,
        recipientId: request.recipientId,
        status: request.status,
      },
      update: { status: request.status },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.friendRequest.deleteMany({ where: { id } });
  }

  async deleteAllBetween(userAId: string, userBId: string): Promise<void> {
    await this.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: userAId, recipientId: userBId },
          { senderId: userBId, recipientId: userAId },
        ],
      },
    });
  }

  async acceptAndBefriend(request: FriendRequest): Promise<void> {
    const { userAId, userBId } = request.pair;
    await this.prisma.$transaction([
      this.prisma.friendRequest.update({ where: { id: request.id }, data: { status: "ACCEPTED" } }),
      this.prisma.friendship.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: { userAId, userBId },
        update: {},
      }),
    ]);
  }

  async listIncoming(userId: string): Promise<FriendRequestView[]> {
    const rows = await this.prisma.friendRequest.findMany({
      where: { recipientId: userId, status: "PENDING" },
      include: { sender: { select: PUBLIC_FIELDS } },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => ({ id: r.id, createdAt: r.updatedAt, player: r.sender }));
  }

  async listOutgoing(userId: string): Promise<FriendRequestView[]> {
    const rows = await this.prisma.friendRequest.findMany({
      where: { senderId: userId, status: "PENDING" },
      include: { recipient: { select: PUBLIC_FIELDS } },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => ({ id: r.id, createdAt: r.updatedAt, player: r.recipient }));
  }
}
