import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationPayload, NotificationType } from "../../domain/entities/notification.entity";
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";
import { NotificationDto, toNotificationDto } from "../dtos/social.dtos";
import { PushNotifier } from "./push-notifier.service";

export interface NotifyInput {
  recipientId: string;
  senderId?: string | null;
  type: NotificationType;
  payload: NotificationPayload;
}

/**
 * Punto unico de salida de notificaciones in-app (US-25).
 *
 * Persiste primero (para que la campana tenga historial aunque el usuario
 * este desconectado) y despues empuja `notification:new` con el contador
 * de no leidas ya calculado, asi la app no necesita otra peticion HTTP.
 * Las que piden accion (invitaciones, solicitudes) salen ademas como aviso
 * push a la barra del telefono, por si la app esta cerrada.
 *
 * Nunca lanza: una notificacion fallida no debe romper la accion social
 * que la origino (aceptar amistad, invitar, terminar partida...).
 */
export class NotificationDispatcher {
  constructor(
    private readonly notifications: INotificationRepository,
    private readonly gateway: IRealtimeGateway,
    private readonly idFactory: () => string = uuidv4,
    private readonly push: PushNotifier | null = null
  ) {}

  async notify(input: NotifyInput): Promise<NotificationDto | null> {
    try {
      const notification = Notification.create({
        id: this.idFactory(),
        recipientId: input.recipientId,
        senderId: input.senderId ?? null,
        type: input.type,
        payload: input.payload,
      });
      await this.notifications.create(notification);
      const unreadCount = await this.notifications.countUnread(input.recipientId);
      const dto = toNotificationDto(notification);
      this.gateway.emitToUser(input.recipientId, "notification:new", { notification: dto, unreadCount });
      // Sin await: FCM puede tardar y la accion social no debe esperarlo.
      void this.push?.push(notification);
      return dto;
    } catch (err) {
      console.warn("[NotificationDispatcher] No se pudo notificar:", (err as Error).message);
      return null;
    }
  }
}
