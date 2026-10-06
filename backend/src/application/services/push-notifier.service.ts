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
 * Solo los tipos que piden una accion del usuario salen a la barra del
 * telefono; el resto se queda en la campana para no saturar a nadie.
 */
const builders: Partial<Record<NotificationType, (p: NotificationPayload, now: number) => Omit<PushMessage, "data">>> = {
  ROOM_INVITE: (p, now) => {
    const room = text(p.roomCode, "");
    const expiresAt = typeof p.expiresAt === "number" ? p.expiresAt : 0;
    return {
      title: `🎮 ${text(p.fromName, "Un amigo")} te invita a jugar`,
      body: `${text(p.wordSearchTitle, "Sopa de letras")} · Sala ${room}. ¡Toca para unirte!`,
      tag: `invite-${room}`,
      // La invitacion caduca: no tiene sentido entregarla despues.
      ttlMs: expiresAt > now ? expiresAt - now : undefined,
    };
  },
  FRIEND_REQUEST: (p) => ({
    title: "👋 Nueva solicitud de amistad",
    body: `${text(p.fromName, "Alguien")} quiere ser tu amigo en WordHive`,
    tag: `friend-request-${text(p.fromUserId, "")}`,
  }),
};

/** Envia el aviso a todos los telefonos del destinatario. Nunca lanza. */
export class PushNotifier {
  constructor(
    private readonly devices: IPushDeviceRepository,
    private readonly sender: IPushSender,
    private readonly clock: () => number = Date.now
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
      const report = await this.sender.send(tokens, { ...build(notification.payload, this.clock()), data });
      if (report.invalidTokens.length > 0) await this.devices.removeTokens(report.invalidTokens);
    } catch (err) {
      console.warn("[PushNotifier] No se pudo enviar el push:", (err as Error).message);
    }
  }
}
