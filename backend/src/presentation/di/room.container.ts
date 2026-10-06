import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { PrismaRoomRepository } from "../../infrastructure/database/repositories/prisma-room.repository";
import { PrismaWordSearchRepository } from "../../infrastructure/database/repositories/prisma-word-search.repository";
import { RedisRoomCache } from "../../infrastructure/cache/redis-room.cache";
import { RoomManagerService } from "../../application/services/room-manager.service";
import { RoomRematchService } from "../../application/services/room-rematch.service";
import { WordSearchGeneratorService } from "../../domain/services/word-search-generator.service";
import { CreateRoomUseCase } from "../../application/use-cases/create-room.use-case";
import { GetRoomByCodeUseCase } from "../../application/use-cases/get-room-by-code.use-case";
import { FinishGameUseCase } from "../../application/use-cases/finish-game.use-case";
import { RoomController } from "../http/controllers/room.controller";
import { RoomEventsHandler } from "../../infrastructure/websocket/handlers/room-events.handler";
import { GameEventsHandler } from "../../infrastructure/websocket/handlers/game-events.handler";
import { SocketDispatcher } from "../../infrastructure/websocket/handlers/socket-dispatcher";
import { SocialContainer } from "./social.container";

export function createRoomContainer(prisma: PrismaClient, redis: Redis, social?: SocialContainer) {
  const roomRepo = new PrismaRoomRepository(prisma);
  const wordSearchRepo = new PrismaWordSearchRepository(prisma);
  const roomCache = new RedisRoomCache(redis);
  const generatorService = new WordSearchGeneratorService();

  const roomManager = new RoomManagerService(roomCache);
  const rematchService = new RoomRematchService(roomCache, generatorService);

  const createRoomUseCase = new CreateRoomUseCase(roomRepo, wordSearchRepo, roomCache);
  const getRoomByCodeUseCase = new GetRoomByCodeUseCase(roomCache, roomRepo);
  const finishGameUseCase = new FinishGameUseCase(roomRepo, roomCache, social?.dispatcher);
  social?.bindRoomReader(roomCache);

  const roomController = new RoomController(createRoomUseCase, getRoomByCodeUseCase);

  const roomEventsHandler = new RoomEventsHandler(roomManager, social?.socketBindings.roomLifecycle);
  const gameEventsHandler = new GameEventsHandler(roomManager, finishGameUseCase, rematchService);
  const socketDispatcher = new SocketDispatcher(
    roomEventsHandler,
    gameEventsHandler,
    roomManager,
    social?.socketBindings
  );

  return {
    roomController,
    socketDispatcher,
    roomManager,
    createRoomUseCase,
    finishGameUseCase,
  };
}
