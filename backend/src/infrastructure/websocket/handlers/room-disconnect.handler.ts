import { Server, Socket } from "socket.io";
import { RoomManagerService } from "../../../application/services/room-manager.service";
import { RoomConnectionService } from "../../../application/services/room-connection.service";

/**
 * Socket de juego que se cae: avisamos a la sala que el jugador esta
 * "reconectando" pero NO lo sacamos. Al volver, la app re-envia room:join y
 * recupera su puesto (y sus puntos si la partida ya habia empezado).
 */
export class RoomDisconnectHandler {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly connection: RoomConnectionService
  ) {}

  public async handle(io: Server, socket: Socket): Promise<void> {
    const roomCode: string | undefined = socket.data.roomCode;
    const userId: string | undefined = socket.data.userId;
    if (!roomCode || !userId) return;

    // Reconexion rapida: otro socket del mismo jugador ya volvio a entrar.
    const sockets = await io.in(`room:${roomCode}`).fetchSockets();
    if (sockets.some((s) => s.data.userId === userId)) return;

    const state = await this.connection.markDisconnected(roomCode, userId);
    if (!state) return;
    io.to(`room:${roomCode}`).emit("player:connection_changed", {
      userId,
      isConnected: false,
      hostUserId: state.hostUserId,
      players: state.players,
    });

    if (state.status === "WAITING") {
      this.connection.scheduleRelease(roomCode, userId, () => this.release(io, roomCode, userId));
    }
  }

  /** Paso la gracia sin volver: se libera el puesto (y el anfitrion pasa a otro si era el). */
  private async release(io: Server, roomCode: string, userId: string): Promise<void> {
    if (!(await this.connection.shouldRelease(roomCode, userId))) return;
    const { state, newHostId } = await this.roomManager.removePlayer(roomCode, userId);
    io.to(`room:${roomCode}`).emit("player:left", {
      userId,
      newHostId,
      hostUserId: state.hostUserId,
      players: state.players,
    });
  }
}
