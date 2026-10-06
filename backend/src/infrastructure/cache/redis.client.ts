import Redis from "ioredis";
import { env } from "../../config/env";

/**
 * Cliente Redis con reconexion automatica, timeout estricto y fallback.
 * enableOfflineQueue: false evita que las peticiones se queden congeladas
 * cuando Redis no esta disponible en desarrollo local.
 */
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  connectTimeout: 2500,
  retryStrategy(times) {
    if (times > 5) return null; // Deja de reintentar para no saturar si esta caido
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redisClient.on("error", (err) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Redis Warn] Advertencia de conexion Redis (usando fallback en memoria):", err.message);
  } else {
    console.error("[Redis Error]", err);
  }
});
