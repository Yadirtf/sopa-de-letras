import { z } from "zod";
import { sanitizeWordsList } from "../../../domain/services/word-search-sanitizer";

export const previewWordSearchSchema = z.object({
  words: z
    .array(z.string())
    .transform(sanitizeWordsList)
    .refine((arr) => arr.length >= 5 && arr.length <= 20, {
      message: "Debes ingresar entre 5 y 20 palabras válidas (de 3 a 15 letras)",
    }),
  gridSize: z.number().int().min(10).max(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export const createWordSearchSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(60),
  description: z.string().trim().max(250).nullable().optional(),
  category: z.string().trim().min(2).max(40),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  gridSize: z.number().int().min(10).max(20),
  words: z
    .array(z.string())
    .transform(sanitizeWordsList)
    .refine((arr) => arr.length >= 5 && arr.length <= 20, {
      message: "Debes ingresar entre 5 y 20 palabras válidas (de 3 a 15 letras)",
    }),
  isPublic: z.boolean().optional().default(true),
});

export const updateWordSearchSchema = z.object({
  title: z.string().trim().min(3).max(60).optional(),
  description: z.string().trim().max(250).nullable().optional(),
  category: z.string().trim().min(2).max(40).optional(),
  isPublic: z.boolean().optional(),
});
