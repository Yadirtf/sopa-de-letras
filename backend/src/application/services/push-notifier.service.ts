import { NotificationPayload, NotificationType } from "../../domain/entities/notification.entity";
import { IPushDeviceRepository } from "../../domain/repositories/push-device.repository.interface";
import { IPushSender, PushMessage } from "../../domain/services/push-sender.interface";

export interface PushableNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  payload: NotificationPayload;
}

const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

/**
 * Traduce una notificacion in-app a un aviso del sistema operativo.
 * Solo lo social (invitaciones y amistades) sale a la barra del telefono;
 * medallas y resultados se quedan en la campana para no saturar a nadie.
 */
/**
 * El banner in-app de una invitacion dura segundos, pero la sala sigue
 * abierta en el lobby mucho mas: si el telefono estaba en reposo, FCM debe
 * seguir intentando entregar el aviso un buen rato en lugar de tirarlo.
 */
export const INVITE_PUSH_TTL_MS = 10 * 60 * 1000;

const builders: Partial<Record<NotificationType, (p: NotificationPayload) => Omit<PushMessage, "data">>> = {
  ROOM_INVITE: (p) => {
    const room = text(p.roomCode, "");
    return {
      title: `🎮 ${text(p.fromName, "Un amigo")} te invita a jugar`,
      body: `${text(p.wordSearchTitle, "Sopa de letras")} · Sala ${room}. ¡Toca para unirte!`,
      tag: `invite-${room}`,
      ttlMs: INVITE_PUSH_TTL_MS,
    };
  },
  FRIEND_REQUEST: (p) => ({
    title: "👋 Nueva solicitud de amistad",
    body: `${text(p.fromName, "Alguien")} quiere ser tu amigo en WordHive`,
    tag: `friend-request-${text(p.fromUserId, "")}`,
  }),
  FRIEND_ACCEPTED: (p) => ({
    title: "🤝 ¡Tienes un nuevo amigo!",
    body: `${text(p.friendName, "Tu amigo")} aceptó tu solicitud. ¡Invítalo a jugar!`,
    tag: `friend-accepted-${text(p.friendId, "")}`,
  }),
};

/** Envia el aviso a todos los telefonos del destinatario. Nunca lanza. */
export class PushNotifier {
  constructor(
    private readonly devices: IPushDeviceRepository,
    private readonly sender: IPushSender
  ) {}

  static supports(type: NotificationType): boolean {
    return type in builders;
  }

  async push(notification: PushableNotification): Promise<void> {
    const build = builders[notification.type];
    if (!build || !this.sender.enabled) return;
    try {
      const tokens = await this.devices.listTokens(notification.recipientId);
      if (tokens.length === 0) return;

      const data: Record<string, string> = { type: notification.type, notificationId: notification.id };
      for (const [key, value] of Object.entries(notification.payload)) {
        if (typeof value === "string" || typeof value === "number") data[key] = String(value);
      }
      const report = await this.sender.send(tokens, { ...build(notification.payload), data });
      if (report.invalidTokens.length > 0) await this.devices.removeTokens(report.invalidTokens);
    } catch (err) {
      console.warn("[PushNotifier] No se pudo enviar el push:", (err as Error).message);
    }
  }
}
