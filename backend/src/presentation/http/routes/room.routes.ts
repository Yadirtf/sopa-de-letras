import { FastifyInstance } from "fastify";
import { RoomController } from "../controllers/room.controller";

export async function roomRoutes(
  fastify: FastifyInstance,
  options: { roomController: RoomController; authMiddleware: any }
): Promise<void> {
  const { roomController, authMiddleware } = options;

  // Crear sala (requiere autenticacion)
  fastify.post(
    "/",
    { preHandler: [authMiddleware] },
    async (request, reply) => roomController.create(request, reply)
  );

  // Obtener info publica de sala por codigo
  fastify.get(
    "/:code",
    async (request, reply) => roomController.getByCode(request, reply)
  );
}
