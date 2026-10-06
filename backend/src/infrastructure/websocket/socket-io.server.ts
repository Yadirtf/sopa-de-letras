import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../../config/env";
import { SocketDispatcher } from "./handlers/socket-dispatcher";

let io: SocketIOServer | null = null;

export function initializeSocketServer(
  server: HttpServer,
  dispatcher?: SocketDispatcher
): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Permitir conexiones de app móvil (sin origin) y frontends
        callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  if (dispatcher) {
    dispatcher.initialize(io);
  }

  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO server aún no ha sido inicializado");
  }
  return io;
}
