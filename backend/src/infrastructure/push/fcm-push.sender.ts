import { App, cert, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { IPushSender, PushMessage, PushSendReport } from "../../domain/services/push-sender.interface";

/** Canal Android que la app crea al arrancar (debe coincidir con el de Flutter). */
export const ANDROID_SOCIAL_CHANNEL = "wordhive_social";

// Errores con los que FCM dice "este telefono ya no existe para ti".
const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

/** FCM permite hasta 500 tokens por llamada multicast. */
const MAX_BATCH = 500;

export class FcmPushSender implements IPushSender {
  readonly enabled = true;
  private readonly messaging: Messaging;

  constructor(app: App) {
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
            icon: "ic_stat_wordhive",
            color: "#7C3AED",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
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
export function createPushSender(rawServiceAccount: string | undefined): IPushSender {
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
    return new FcmPushSender(app);
  } catch (err) {
    console.error("[Push] FIREBASE_SERVICE_ACCOUNT invalido, push desactivado:", (err as Error).message);
    return new DisabledPushSender();
  }
}
