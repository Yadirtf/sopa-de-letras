import { FastifyInstance } from "fastify";
import { FriendsController } from "../controllers/friends.controller";

export async function friendsRoutes(
  fastify: FastifyInstance,
  options: { friendsController: FriendsController; authMiddleware: any }
) {
  const { friendsController: c, authMiddleware } = options;
  const auth = { preHandler: [authMiddleware] };

  fastify.get("/", auth, c.list);
  fastify.get("/search", auth, c.search);
  fastify.get("/requests", auth, c.requests);
  fastify.post("/requests", auth, c.sendRequest);
  fastify.patch("/requests/:requestId", auth, c.respondRequest);
  fastify.delete("/:userId", auth, c.remove);
  fastify.post("/:userId/invite", auth, c.invite);
}
