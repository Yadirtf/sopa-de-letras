import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user.controller";

export async function userRoutes(
  fastify: FastifyInstance,
  options: {
    userController: UserController;
    authMiddleware: any;
  }
) {
  const { userController, authMiddleware } = options;

  fastify.get("/me", { preHandler: [authMiddleware] }, userController.getProfile);
  fastify.patch("/me", { preHandler: [authMiddleware] }, userController.updateProfile);
  fastify.put("/me/pin", { preHandler: [authMiddleware] }, userController.updatePin);
}
