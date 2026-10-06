import { Notification } from "../entities/notification.entity";

export interface NotificationPage {
  items: Notification[];
  nextCursor: string | null;
}

export interface INotificationRepository {
  create(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  listForRecipient(recipientId: string, limit: number, cursor?: string): Promise<NotificationPage>;
  countUnread(recipientId: string): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(recipientId: string): Promise<number>;
}
