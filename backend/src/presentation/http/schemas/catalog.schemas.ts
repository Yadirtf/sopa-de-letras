import { z } from "zod";

export const catalogQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().max(40).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  search: z.string().max(50).optional(),
});

export const wordSearchIdParamSchema = z.object({
  id: z.string().min(1, "El ID de la sopa es requerido"),
});
