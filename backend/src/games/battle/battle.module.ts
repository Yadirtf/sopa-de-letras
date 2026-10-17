import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { Server } from "socket.io";
import { ITokenService } from "../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../domain/services/session-cache.interface";
import { BattleLobbyService } from "./application/battle-lobby.service";
import { BattleLock } from "./application/battle-lock";
import { BattlePlayService } from "./application/battle-play.service";
import { RedisBattleMatchStore } from "./infrastructure/redis-battle-match.store";
import {
  PrismaBattleResultRecorder,
  PrismaBattleUserDirectory,
  TimerBattleScheduler,
} from "./infrastructure/prisma-battle.adapters";
import { BattleSocketGateway } from "./infrastructure/battle-socket.gateway";
import { BattlePresenceListener } from "./application/battle-ports";
import { BattleRoomReader } from "./application/battle-room-reader";
import { BattleReactionsService } from "./application/battle-reactions.service";
import { BattleController } from "./presentation/battle.controller";

/**
 * Modulo "La Batalla Mas Temida". Es lo unico que el resto del backend conoce
 * del juego: registra sus rutas HTTP y su espacio de socket `/battle`.
 * La sopa de letras no sabe que existe, y la batalla solo usa de afuera las
 * cuentas (token y sesion) y la tabla de usuarios. Hacia lo social solo
 * expone `roomReader` (para invitar amigos) y avisa de la presencia.
 */
export function createBattleModule(deps: {
  prisma: PrismaClient;
  redis: Redis;
  tokenService: ITokenService;
  sessionCache: ISessionCacheService;
  presence?: BattlePresenceListener;
}) {
  const store = new RedisBattleMatchStore(deps.redis);
  const users = new PrismaBattleUserDirectory(deps.prisma);
  const lock = new BattleLock();
  const lobby = new BattleLobbyService(store, lock);

  let play: BattlePlayService | null = null;
  let reactions: BattleReactionsService | null = null;
  const gateway = new BattleSocketGateway(
    deps.tokenService,
    deps.sessionCache,
    users,
    lobby,
    () => play!,
    deps.presence,
    () => reactions!
  );
  const scheduler = new TimerBattleScheduler();
  play = new BattlePlayService(store, gateway, scheduler, new PrismaBattleResultRecorder(deps.prisma), lock);
  reactions = new BattleReactionsService(store, gateway, scheduler);

  const controller = new BattleController(lobby, users);

  return {
    roomReader: new BattleRoomReader(store),
    async registerRoutes(fastify: FastifyInstance, authMiddleware: any): Promise<void> {
      fastify.get("/api/v1/games", controller.games);
      await fastify.register(
        async (scope) => {
          scope.get("/catalog", controller.catalog);
          scope.get("/recommendation", controller.recommendation);
          scope.post("/rooms", { preHandler: [authMiddleware] }, controller.create);
          scope.get("/rooms/:code", controller.getByCode);
        },
        { prefix: "/api/v1/battle" }
      );
    },
    attachSocket(io: Server): void {
      gateway.attach(io);
    },
  };
}
