import { FastifyInstance } from "fastify";
import { CatalogController } from "../controllers/catalog.controller";
import { WordSearchEditorController } from "../controllers/word-search-editor.controller";

export interface WordSearchRoutesOptions {
  catalogController: CatalogController;
  editorController: WordSearchEditorController;
  authMiddleware: any;
}

export async function wordSearchRoutes(
  fastify: FastifyInstance,
  options: WordSearchRoutesOptions
) {
  const { catalogController, editorController, authMiddleware } = options;

  // Rutas públicas
  fastify.get("/", catalogController.getCatalog);
  fastify.post("/preview", editorController.preview);
  fastify.get("/my", { preHandler: [authMiddleware] }, editorController.getMy);
  fastify.get("/:id", catalogController.getWordSearchDetail);

  // Rutas protegidas de creación y gestión (Épica 3)
  fastify.post("/", { preHandler: [authMiddleware] }, editorController.create);
  fastify.put("/:id", { preHandler: [authMiddleware] }, editorController.update);
  fastify.delete("/:id", { preHandler: [authMiddleware] }, editorController.delete);
}
