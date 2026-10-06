/** Aviso que aparece en la barra de notificaciones del telefono. */
export interface PushMessage {
  title: string;
  body: string;
  /** Datos que la app lee al tocar el aviso (siempre strings, regla de FCM). */
  data: Record<string, string>;
  /** Agrupa avisos: uno nuevo con el mismo tag reemplaza al anterior. */
  tag: string;
  /** Si el telefono esta apagado mas tiempo, el aviso ya no se entrega. */
  ttlMs?: number;
}

export interface PushSendReport {
  /** Tokens que FCM rechazo de forma definitiva y conviene olvidar. */
  invalidTokens: string[];
}

/** Puerto de salida hacia el proveedor de push (FCM hoy, otro manana). */
export interface IPushSender {
  readonly enabled: boolean;
  send(tokens: string[], message: PushMessage): Promise<PushSendReport>;
}
