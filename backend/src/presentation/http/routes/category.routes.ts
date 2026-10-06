import { FastifyInstance } from "fastify";
import { CategoryController } from "../controllers/category.controller";

export async function categoryRoutes(
  fastify: FastifyInstance,
  options: { categoryController: CategoryController; authMiddleware: any }
) {
  const { categoryController: c, authMiddleware } = options;

  fastify.get("/", c.search);
  fastify.post("/", { preHandler: [authMiddleware] }, c.create);
}
