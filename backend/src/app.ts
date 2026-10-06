/**
 * WordHive Backend — Entry Point
 * 
 * Arquitectura: Clean Architecture (Domain → Application → Infrastructure → Presentation)
 * Framework: Fastify v4 + Socket.IO v4
 * 
 * Este archivo SOLO hace bootstrap. Toda la logica va en sus capas correspondientes.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { registerRoutes } from "./presentation/http/routes";
import { initializeSocketServer } from "./infrastructure/websocket/socket-io.server";
import { prismaClient } from "./infrastructure/database/prisma/prisma.client";
import { redisClient } from "./infrastructure/cache/redis.client";
import { env } from "./config/env";

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  // Plugins de seguridad
  await app.register(helmet);
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });
  await app.register(rateLimit, {
    global: false, // rate limit se aplica por ruta, no globalmente
    redis: redisClient,
  });

  // Health check — necesario para Render.com
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // Registrar todas las rutas HTTP
  await registerRoutes(app);

  // Inicializar Socket.IO con el servidor HTTP de Fastify
  initializeSocketServer(app.server);

  // Conectar a base de datos
  await prismaClient.$connect();

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info(`Recibida señal ${signal}. Cerrando conexiones...`);
  await prismaClient.$disconnect();
  await redisClient.quit();
  await app.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap().catch((err) => {
  console.error("Error fatal en bootstrap:", err);
  process.exit(1);
});

