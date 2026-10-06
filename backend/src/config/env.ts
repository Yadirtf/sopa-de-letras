/**
 * Validacion y tipado de variables de entorno usando Zod.
 * Falla rapido en arranque si falta alguna variable requerida.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("7d"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  APP_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno invalidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

