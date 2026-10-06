import { Server } from "socket.io";
import { IRealtimeGateway } from "../../domain/services/realtime-gateway.interface";

/** Canal privado de cada usuario: todas sus pestañas/dispositivos se unen aqui. */
export const userChannel = (userId: string): string => `user:${userId}`;

/**
 * Implementacion Socket.IO del gateway. Recibe el servidor de forma perezosa
 * porque las rutas HTTP (y sus casos de uso) se construyen antes que Socket.IO.
 */
export class SocketIoRealtimeGateway implements IRealtimeGateway {
  private io: Server | null = null;

  attach(io: Server): void {
    this.io = io;
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.io?.to(userChannel(userId)).emit(event, payload);
  }

  emitToUsers(userIds: string[], event: string, payload: unknown): void {
    if (!this.io || userIds.length === 0) return;
    this.io.to(userIds.map(userChannel)).emit(event, payload);
  }
}
