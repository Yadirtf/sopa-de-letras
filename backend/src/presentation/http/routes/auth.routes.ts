import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";

export async function authRoutes(
  fastify: FastifyInstance,
  options: { authController: AuthController }
) {
  const { authController } = options;

  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/guest", authController.guestLogin);
  fastify.post("/forgot-pin", authController.forgotPin);
  fastify.post("/reset-pin", authController.resetPin);
}
