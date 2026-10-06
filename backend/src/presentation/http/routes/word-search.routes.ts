import { FastifyInstance } from "fastify";
import { CatalogController } from "../controllers/catalog.controller";

export async function wordSearchRoutes(
  fastify: FastifyInstance,
  options: { catalogController: CatalogController }
) {
  const { catalogController } = options;

  fastify.get("/", catalogController.getCatalog);
  fastify.get("/:id", catalogController.getWordSearchDetail);
}
