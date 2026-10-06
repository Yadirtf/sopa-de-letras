import Redis from "ioredis";
import { env } from "../../config/env";

/**
 * Cliente Redis con reconexion automatica y backoff exponencial.
 */
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: true,
});

redisClient.on("error", (err) => {
  // Evitar que errores no capturados de red colapsen el servidor en dev
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Redis Warn] Advertencia de conexion Redis:", err.message);
  } else {
    console.error("[Redis Error]", err);
  }
});
