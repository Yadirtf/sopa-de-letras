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
  JWT_ACCESS_EXPIRY: z.string().default("24h"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),
  SMTP_HOST: z.string().default("smtp.example.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("noreply@wordhive.com"),
  SMTP_PASS: z.string().default("changeme"),
  SMTP_FROM: z.string().default("noreply@wordhive.com"),
  APP_URL: z.string().default("https://wordhive-api.onrender.com"),
  FRONTEND_URL: z.string().default("https://wordhive-landing.onrender.com"),
  // Donde vive la version web del juego (enlaces de invitacion, QR y avisos push).
  PLAY_URL: z.string().default("https://wordhive-landing.onrender.com/jugar"),
  // Cuenta de servicio de Firebase (JSON o base64). Sin ella no hay avisos push.
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno invalidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
