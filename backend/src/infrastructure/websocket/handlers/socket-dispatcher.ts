import { Server, Socket } from "socket.io";
import { RoomEventsHandler, RoomLifecycleListener } from "./room-events.handler";
import { GameEventsHandler } from "./game-events.handler";
import { PresenceEventsHandler } from "./presence-events.handler";
import { RoomDisconnectHandler } from "./room-disconnect.handler";

export class SocketDispatcher {
  constructor(
    private readonly roomEventsHandler: RoomEventsHandler,
    private readonly gameEventsHandler: GameEventsHandler,
    private readonly disconnectHandler: RoomDisconnectHandler,
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

      socket.on("disconnect", () => {
        const userId: string | undefined = socket.data.userId;
        if (socket.data.roomCode && userId) this.social?.roomLifecycle.onPlayerLeft(userId);
        // Perder internet no es abandonar: el jugador conserva su puesto (ver RoomDisconnectHandler).
        this.disconnectHandler.handle(io, socket).catch(() => undefined);
      });
    });
  }
}
