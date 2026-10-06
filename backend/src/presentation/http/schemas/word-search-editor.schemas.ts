import { z } from "zod";

export const previewWordSearchSchema = z.object({
  words: z.array(z.string().min(3).max(15)).min(5).max(20),
  gridSize: z.number().int().min(10).max(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export const createWordSearchSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(60),
  description: z.string().trim().max(250).optional(),
  category: z.string().trim().min(2).max(40),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  gridSize: z.number().int().min(10).max(20),
  words: z.array(z.string().min(3).max(15)).min(5).max(20),
  isPublic: z.boolean().optional().default(true),
});

export const updateWordSearchSchema = z.object({
  title: z.string().trim().min(3).max(60).optional(),
  description: z.string().trim().max(250).nullable().optional(),
  category: z.string().trim().min(2).max(40).optional(),
  isPublic: z.boolean().optional(),
});
