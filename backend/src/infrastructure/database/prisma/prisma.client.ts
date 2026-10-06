import { PrismaClient } from "@prisma/client";

/**
 * Cliente singleton de Prisma ORM para conexion a PostgreSQL.
 */
export const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
