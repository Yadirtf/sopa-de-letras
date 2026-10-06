import { Socket } from "socket.io";
import { RoomFlowError } from "../../../application/services/room-lifecycle.service";

/**
 * Antes los errores de sala se tragaban en silencio y el boton "no hacia nada".
 * Ahora siempre vuelven al jugador que pulso, con codigo y texto amable.
 */
export function emitRoomError(socket: Socket, err: unknown): void {
  if (err instanceof RoomFlowError) {
    socket.emit("room:error", { code: err.code, message: err.message });
    return;
  }
  const code = err instanceof Error ? err.message : "ERROR_DESCONOCIDO";
  socket.emit("room:error", { code, message: "No pudimos completar la acción. Inténtalo de nuevo." });
}
