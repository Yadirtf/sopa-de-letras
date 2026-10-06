import { z } from "zod";

export const searchPlayersSchema = z.object({
  q: z.string().max(25, "La busqueda es demasiado larga").default(""),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1, "Falta el jugador"),
});

export const requestIdParamSchema = z.object({
  requestId: z.string().min(1, "Falta la solicitud"),
});

export const sendFriendRequestSchema = z.object({
  userId: z.string().min(1, "Falta el jugador"),
});

export const respondFriendRequestSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "CANCEL"], {
    errorMap: () => ({ message: "Accion invalida: usa ACCEPT, REJECT o CANCEL" }),
  }),
});

export const roomInviteSchema = z.object({
  roomCode: z.string().min(4, "Codigo de sala invalido").max(12),
});

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1),
});
