import { Server, Socket } from "socket.io";
import { RoomEventsHandler, RoomLifecycleListener } from "./room-events.handler";
import { GameEventsHandler } from "./game-events.handler";
import { PresenceEventsHandler } from "./presence-events.handler";
import { RoomManagerService } from "../../../application/services/room-manager.service";

export class SocketDispatcher {
  constructor(
    private readonly roomEventsHandler: RoomEventsHandler,
    private readonly gameEventsHandler: GameEventsHandler,
    private readonly roomManager: RoomManagerService,
    private readonly social?: {
      presenceHandler: PresenceEventsHandler;
      roomLifecycle: RoomLifecycleListener;
      onServerReady: (io: Server) => void;
    }
  ) {}

  public initialize(io: Server): void {
    this.social?.onServerReady(io);

    io.on("connection", (socket: Socket) => {
      this.roomEventsHandler.register(io, socket);
      this.gameEventsHandler.register(io, socket);
      this.social?.presenceHandler.register(io, socket).catch(() => undefined);

      socket.on("disconnect", async () => {
        const roomCode = (socket as any).roomCode;
        const userId = (socket as any).userId;
        if (roomCode && userId) {
          this.social?.roomLifecycle.onPlayerLeft(userId);
          try {
            const { state, newHostId } = await this.roomManager.removePlayer(roomCode, userId);
            io.to(`room:${roomCode}`).emit("player:left", {
              userId,
              newHostId,
              players: state.players,
            });
          } catch {
            // Ignored on disconnect
          }
        }
      });
    });
  }
}
