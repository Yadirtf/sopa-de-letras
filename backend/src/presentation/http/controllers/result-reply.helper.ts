import { FastifyReply } from "fastify";
import { ZodError, ZodType } from "zod";
import { DomainError } from "../../../domain/errors/auth.errors";
import { Result } from "../../../application/common/result";

/**
 * Traduce un Result del caso de uso a HTTP. Los errores de dominio llevan su
 * propio statusCode; cualquier otra cosa es un 500 sin filtrar detalles internos.
 */
export function sendResult<T>(reply: FastifyReply, result: Result<T, DomainError>, successStatus = 200) {
  if (result.isSuccess) return reply.status(successStatus).send(result.value);

  // En runtime puede llegar cualquier Error (Prisma, Redis...) aunque el tipo diga DomainError.
  const error: unknown = result.error;
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message });
  }
  reply.log.error({ err: error }, "[sendResult] Error inesperado");
  return reply.status(500).send({ code: "INTERNAL_ERROR", message: "Algo salio mal. Intenta de nuevo" });
}

/** Valida con Zod y responde 400 legible; devuelve null si ya se respondio. */
export function parseOrReply<T>(reply: FastifyReply, schema: ZodType<T, any, any>, input: unknown): T | null {
  try {
    return schema.parse(input ?? {});
  } catch (err) {
    const message = err instanceof ZodError ? err.issues[0]?.message ?? "Datos invalidos" : "Datos invalidos";
    reply.status(400).send({ code: "VALIDATION_ERROR", message });
    return null;
  }
}
