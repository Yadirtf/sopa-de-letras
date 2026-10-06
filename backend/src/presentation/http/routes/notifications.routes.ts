import { FastifyInstance } from "fastify";
import { NotificationsController } from "../controllers/notifications.controller";

export async function notificationsRoutes(
  fastify: FastifyInstance,
  options: { notificationsController: NotificationsController; authMiddleware: any }
) {
  const { notificationsController: c, authMiddleware } = options;
  const auth = { preHandler: [authMiddleware] };

  fastify.get("/", auth, c.list);
  // read-all se registra antes que /:id/read para que no se interprete como un id.
  fastify.patch("/read-all", auth, c.markAllRead);
  fastify.patch("/:id/read", auth, c.markRead);
}
