import { FastifyRequest, FastifyReply } from "fastify";
import { ITokenService, TokenPayload } from "../../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../../domain/services/session-cache.interface";

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export function createAuthMiddleware(
  tokenService: ITokenService,
  sessionCache: ISessionCacheService
) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Cabecera de autorización faltante o inválida",
      });
    }

    const token = authHeader.substring(7);
    const payload = tokenService.verifyAccessToken(token);

    if (!payload) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Token de acceso expirado o corrupto",
      });
    }

    const activeSession = await sessionCache.getSession(payload.userId);
    if (!activeSession) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "La sesión ha expirado o ha sido revocada",
      });
    }

    request.user = payload;
  };
}
