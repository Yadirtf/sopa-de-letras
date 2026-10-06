import { PrismaClient, Prisma } from "@prisma/client";
import { Notification, NotificationPayload } from "../../../domain/entities/notification.entity";
import {
  INotificationRepository,
  NotificationPage,
} from "../../../domain/repositories/notification.repository.interface";

type NotificationRow = Prisma.NotificationGetPayload<object>;

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(notification: Notification): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: notification.id,
        recipientId: notification.recipientId,
        senderId: notification.senderId,
        type: notification.type,
        payload: notification.payload as Prisma.InputJsonObject,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async listForRecipient(recipientId: string, limit: number, cursor?: string): Promise<NotificationPage> {
    // Pedimos uno de mas para saber si existe otra pagina sin un COUNT extra.
    const rows = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: pageRows.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? pageRows[pageRows.length - 1].id : null,
    };
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.prisma.notification.count({ where: { recipientId, isRead: false } });
  }

  async markRead(id: string): Promise<void> {
    await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(recipientId: string): Promise<number> {
    const { count } = await this.prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true },
    });
    return count;
  }

  private toDomain(row: NotificationRow): Notification {
    return Notification.restore({
      id: row.id,
      recipientId: row.recipientId,
      senderId: row.senderId,
      type: row.type,
      payload: (row.payload ?? {}) as NotificationPayload,
      isRead: row.isRead,
      createdAt: row.createdAt,
    });
  }
}
