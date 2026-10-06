import { INotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { NotificationNotFoundError } from "../../domain/errors/social.errors";
import { Result, ok, fail } from "../common/result";

/** Marcar como leidas: una tarjeta o toda la campana de golpe (US-25). */
export class MarkNotificationsReadUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async markOne(userId: string, notificationId: string): Promise<Result<{ unreadCount: number }, DomainError>> {
    try {
      const notification = await this.notifications.findById(notificationId);
      // Responder 404 tambien si es ajena evita revelar ids de otros usuarios.
      if (!notification || !notification.belongsTo(userId)) return fail(new NotificationNotFoundError());

      if (!notification.isRead) {
        notification.markAsRead();
        await this.notifications.markRead(notification.id);
      }
      return ok({ unreadCount: await this.notifications.countUnread(userId) });
    } catch (error) {
      return fail(error as DomainError);
    }
  }

  async markAll(userId: string): Promise<Result<{ updated: number; unreadCount: number }, DomainError>> {
    try {
      const updated = await this.notifications.markAllRead(userId);
      return ok({ updated, unreadCount: 0 });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
