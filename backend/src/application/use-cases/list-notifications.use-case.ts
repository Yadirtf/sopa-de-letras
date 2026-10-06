import { INotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { NotificationListDto, toNotificationDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** Historial paginado de la campana + contador de no leidas (US-25 / RF-30). */
export class ListNotificationsUseCase {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(userId: string, limit?: number, cursor?: string): Promise<Result<NotificationListDto, DomainError>> {
    try {
      const safeLimit = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
      const [page, unreadCount] = await Promise.all([
        this.notifications.listForRecipient(userId, safeLimit, cursor),
        this.notifications.countUnread(userId),
      ]);
      return ok({ items: page.items.map(toNotificationDto), nextCursor: page.nextCursor, unreadCount });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
