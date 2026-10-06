import { Server, Socket } from "socket.io";
import { ITokenService } from "../../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../../domain/services/session-cache.interface";
import { PresenceBroadcaster } from "../../../application/services/presence-broadcaster.service";
import { userChannel } from "../socket-io-realtime.gateway";

/**
 * Socket "social" de la app (US-23/US-24/US-25).
 *
 * La app conecta con `auth: { token }` en el handshake. Validamos el JWT y
 * la sesion activa en Redis; si todo cuadra, el socket entra al canal privado
 * `user:{id}` por donde llegan notificaciones, invitaciones y presencia.
 * Los sockets de juego anonimos (sin token) simplemente se ignoran aqui.
 */
export class PresenceEventsHandler {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly sessionCache: ISessionCacheService,
    private readonly broadcaster: PresenceBroadcaster
  ) {}

  public async register(io: Server, socket: Socket): Promise<void> {
    const userId = await this.authenticate(socket);
    if (!userId) return;

    socket.data.socialUserId = userId;
    await socket.join(userChannel(userId));
    socket.emit("presence:ready", { userId });
    await this.broadcaster.connected(userId).catch(() => undefined);

    socket.on("presence:heartbeat", () => {
      this.broadcaster.heartbeat(userId).catch(() => undefined);
    });

    socket.on("disconnect", async () => {
      // Solo pasa a OFFLINE cuando se cierra el ULTIMO dispositivo del usuario.
      const remaining = await io.in(userChannel(userId)).fetchSockets();
      if (remaining.length === 0) {
        await this.broadcaster.disconnected(userId).catch(() => undefined);
      }
    });
  }

  private async authenticate(socket: Socket): Promise<string | null> {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || token.length === 0) return null;

    const payload = this.tokenService.verifyAccessToken(token);
    if (!payload) {
      socket.emit("presence:unauthorized", { message: "Sesion expirada" });
      return null;
    }
    const activeSession = await this.sessionCache.getSession(payload.userId).catch(() => null);
    if (!activeSession) {
      socket.emit("presence:unauthorized", { message: "Sesion expirada" });
      return null;
    }
    return payload.userId;
  }
}
