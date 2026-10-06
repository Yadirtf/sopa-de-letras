import { Server, Socket } from "socket.io";
import { RoomManagerService } from "../../../application/services/room-manager.service";
import { RoomLifecycleService } from "../../../application/services/room-lifecycle.service";
import { emitRoomError } from "./room-error.emitter";

/** Ganchos opcionales para que otros modulos (presencia EP-05) sepan quien entra y sale de salas. */
export interface RoomLifecycleListener {
  onPlayerJoined(userId: string, roomCode: string): void;
  onPlayerLeft(userId: string): void;
}

export class RoomEventsHandler {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly roomLifecycle: RoomLifecycleService,
    private readonly lifecycle?: RoomLifecycleListener
  ) {}

  public register(io: Server, socket: Socket): void {
    socket.on("room:join", async (payload: { roomCode: string; userId: string; username: string; avatarUrl?: string }, ack) => {
      try {
        const { roomCode, userId, username, avatarUrl } = payload;
        const upperCode = roomCode.toUpperCase();
        const { state, joinedPlayer } = await this.roomManager.addPlayer(upperCode, {
          userId,
          username,
          avatarUrl,
        });

        socket.join(`room:${upperCode}`);
        socket.data.roomCode = upperCode;
        socket.data.userId = userId;
        this.lifecycle?.onPlayerJoined(userId, upperCode);

        io.to(`room:${upperCode}`).emit("player:joined", {
          player: joinedPlayer,
          players: state.players,
          hostUserId: state.hostUserId,
          roomCode: upperCode,
        });

        if (typeof ack === "function") ack({ success: true, room: state });
      } catch (err: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: err.message });
        } else {
          emitRoomError(socket, err);
        }
      }
    });

    socket.on("room:leave", async (payload: { roomCode: string; userId: string }) => {
      try {
        const { roomCode, userId } = payload;
        const upperCode = roomCode.toUpperCase();
        // Se limpia antes: si luego se corta la conexion, no hay que sacarlo otra vez.
        socket.data.roomCode = undefined;
        socket.leave(`room:${upperCode}`);
        const { state, newHostId } = await this.roomManager.removePlayer(upperCode, userId);
        this.lifecycle?.onPlayerLeft(userId);

        io.to(`room:${upperCode}`).emit("player:left", {
          userId,
          newHostId,
          hostUserId: state.hostUserId,
          players: state.players,
        });
      } catch {
        // La sala ya no existe: no hay nadie a quien avisar.
      }
    });

    socket.on("room:toggle_ready", async (payload: { roomCode: string; userId: string; isReady: boolean }) => {
      try {
        const { roomCode, userId, isReady } = payload;
        const upperCode = roomCode.toUpperCase();
        const state = await this.roomLifecycle.setReady(upperCode, userId, isReady);
        const player = state.players.find((p) => p.userId === userId);

        io.to(`room:${upperCode}`).emit("player:ready_changed", {
          userId,
          isReady: player?.isReady ?? isReady,
          hostUserId: state.hostUserId,
          players: state.players,
        });
      } catch (err) {
        emitRoomError(socket, err);
      }
    });
  }
}
