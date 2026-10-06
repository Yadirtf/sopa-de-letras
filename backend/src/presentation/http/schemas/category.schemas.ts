import { z } from "zod";

export const categorySearchQuerySchema = z.object({
  search: z.string().max(40).optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Escribe el nombre del tema" })
    .trim()
    .min(2, "El tema debe tener al menos 2 letras")
    .max(40, "El tema puede tener hasta 40 letras"),
});
