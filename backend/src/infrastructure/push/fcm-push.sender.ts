import { App, cert, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { IPushSender, PushMessage, PushSendReport } from "../../domain/services/push-sender.interface";

/**
 * Canal Android que la app crea al arrancar (debe coincidir con el de Flutter).
 * Es "_v2" porque Android no deja subir la importancia de un canal ya creado:
 * el nuevo nace con importancia maxima (sonido + aviso flotante tipo WhatsApp).
 */
export const ANDROID_SOCIAL_CHANNEL = "wordhive_social_v2";

// Errores con los que FCM dice "este telefono ya no existe para ti".
const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

/** FCM permite hasta 500 tokens por llamada multicast. */
const MAX_BATCH = 500;

/**
 * Pagina de la web que abre el aviso al hacer clic en el navegador: la sala
 * de la invitacion, las solicitudes de amistad o la bandeja de avisos.
 */
export function webLinkFor(playUrl: string, data: Record<string, string>): string {
  const base = playUrl.replace(/\/+$/, "");
  if (data.type === "ROOM_INVITE" && data.roomCode) return `${base}/room/${data.roomCode.toUpperCase()}`;
  if (data.type === "FRIEND_REQUEST" || data.type === "FRIEND_ACCEPTED") return `${base}/friends`;
  return `${base}/notifications`;
}

export class FcmPushSender implements IPushSender {
  readonly enabled = true;
  private readonly messaging: Messaging;

  constructor(app: App, private readonly playUrl: string) {
    this.messaging = getMessaging(app);
  }

  async send(tokens: string[], message: PushMessage): Promise<PushSendReport> {
    const invalidTokens: string[] = [];
    for (let i = 0; i < tokens.length; i += MAX_BATCH) {
      const batch = tokens.slice(i, i + MAX_BATCH);
      const response = await this.messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title: message.title, body: message.body },
        data: message.data,
        android: {
          priority: "high",
          ttl: message.ttlMs,
          collapseKey: message.tag,
          notification: {
            channelId: ANDROID_SOCIAL_CHANNEL,
            tag: message.tag,
            // Como un mensaje de WhatsApp: sonido, vibracion, aviso flotante
            // y visible completo en la pantalla de bloqueo.
            priority: "max",
            visibility: "public",
            defaultSound: true,
            defaultVibrateTimings: true,
            defaultLightSettings: true,
            notificationCount: 1,
            icon: "ic_stat_wordhive",
            color: "#7C3AED",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        // Navegadores (version web): icono de la Abejita y clic que abre la pagina justa.
        webpush: {
          notification: { icon: `${this.playUrl}/icons/Icon-192.png`, tag: message.tag, renotify: true },
          fcmOptions: { link: webLinkFor(this.playUrl, message.data) },
        },
      });
      response.responses.forEach((r, idx) => {
        if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) invalidTokens.push(batch[idx]);
      });
    }
    return { invalidTokens };
  }
}

/** Sin credenciales de Firebase el backend sigue funcionando, solo sin push. */
export class DisabledPushSender implements IPushSender {
  readonly enabled = false;
  async send(): Promise<PushSendReport> {
    return { invalidTokens: [] };
  }
}

/**
 * Lee la cuenta de servicio de FIREBASE_SERVICE_ACCOUNT (JSON tal cual o en
 * base64, lo que sea mas comodo de pegar en Render).
 */
export function createPushSender(rawServiceAccount: string | undefined, playUrl: string): IPushSender {
  if (!rawServiceAccount?.trim()) {
    console.info("[Push] FIREBASE_SERVICE_ACCOUNT no definido: avisos push desactivados.");
    return new DisabledPushSender();
  }
  try {
    const raw = rawServiceAccount.trim();
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const account = JSON.parse(json);
    const app = initializeApp({ credential: cert(account), projectId: account.project_id }, "wordhive-push");
    console.info(`[Push] FCM activo para el proyecto ${account.project_id}.`);
    return new FcmPushSender(app, playUrl);
  } catch (err) {
    console.error("[Push] FIREBASE_SERVICE_ACCOUNT invalido, push desactivado:", (err as Error).message);
    return new DisabledPushSender();
  }
}
