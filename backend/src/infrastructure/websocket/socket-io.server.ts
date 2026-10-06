import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../../config/env";

let io: SocketIOServer | null = null;

/**
 * Inicializador del servidor Socket.IO para comunicacion en tiempo real.
 */
export function initializeSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket) => {
    // Registro de conexion inicial
    socket.on("disconnect", () => {
      // Manejo de desconexion
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO server aún no ha sido inicializado");
  }
  return io;
}
