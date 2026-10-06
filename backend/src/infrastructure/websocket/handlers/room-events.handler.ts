import { Server, Socket } from "socket.io";
import { RoomManagerService } from "../../../application/services/room-manager.service";

export class RoomEventsHandler {
  constructor(private readonly roomManager: RoomManagerService) {}

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
        (socket as any).roomCode = upperCode;
        (socket as any).userId = userId;

        io.to(`room:${upperCode}`).emit("player:joined", {
          player: joinedPlayer,
          players: state.players,
          roomCode: upperCode,
        });

        if (typeof ack === "function") {
          ack({ success: true, room: state });
        }
      } catch (err: any) {
        if (typeof ack === "function") {
          ack({ success: false, error: err.message });
        } else {
          socket.emit("room:error", { message: err.message });
        }
      }
    });

    socket.on("room:leave", async (payload: { roomCode: string; userId: string }) => {
      try {
        const { roomCode, userId } = payload;
        const upperCode = roomCode.toUpperCase();
        const { state, newHostId } = await this.roomManager.removePlayer(upperCode, userId);
        socket.leave(`room:${upperCode}`);

        io.to(`room:${upperCode}`).emit("player:left", {
          userId,
          newHostId,
          players: state.players,
        });
      } catch {
        // Silently handle
      }
    });

    socket.on("room:toggle_ready", async (payload: { roomCode: string; userId: string; isReady: boolean }) => {
      try {
        const { roomCode, userId, isReady } = payload;
        const upperCode = roomCode.toUpperCase();
        const state = await this.roomManager.toggleReady(upperCode, userId, isReady);

        io.to(`room:${upperCode}`).emit("player:ready_changed", {
          userId,
          isReady,
          players: state.players,
        });
      } catch {
        // Silently handle
      }
    });
  }
}
