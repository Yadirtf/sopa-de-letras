import { FastifyInstance } from "fastify";
import { prismaClient } from "../../../infrastructure/database/prisma/prisma.client";
import { redisClient } from "../../../infrastructure/cache/redis.client";
import { PrismaUserRepository } from "../../../infrastructure/database/repositories/prisma-user.repository";
import { PrismaWordSearchRepository } from "../../../infrastructure/database/repositories/prisma-word-search.repository";
import { BcryptHashService } from "../../../infrastructure/security/bcrypt-hash.service";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token.service";
import { RedisSessionCache } from "../../../infrastructure/cache/redis-session.cache";
import { RedisCatalogCache } from "../../../infrastructure/cache/redis-catalog.cache";
import { NodemailerMailService } from "../../../infrastructure/mail/nodemailer-mail.service";
import { WordSearchGeneratorService } from "../../../domain/services/word-search-generator.service";
import { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../../application/use-cases/login-user.use-case";
import { GuestLoginUseCase } from "../../../application/use-cases/guest-login.use-case";
import { ForgotPinUseCase } from "../../../application/use-cases/forgot-pin.use-case";
import { ResetPinUseCase } from "../../../application/use-cases/reset-pin.use-case";
import { GetProfileUseCase } from "../../../application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../../application/use-cases/update-profile.use-case";
import { UpdatePinUseCase } from "../../../application/use-cases/update-pin.use-case";
import { GetCatalogListUseCase } from "../../../application/use-cases/get-catalog-list.use-case";
import { GetWordSearchDetailUseCase } from "../../../application/use-cases/get-word-search-detail.use-case";
import { PreviewWordSearchUseCase } from "../../../application/use-cases/preview-word-search.use-case";
import { CreateWordSearchUseCase } from "../../../application/use-cases/create-word-search.use-case";
import { GetMyWordSearchesUseCase } from "../../../application/use-cases/get-my-word-searches.use-case";
import { UpdateWordSearchUseCase } from "../../../application/use-cases/update-word-search.use-case";
import { DeleteWordSearchUseCase } from "../../../application/use-cases/delete-word-search.use-case";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { CatalogController } from "../controllers/catalog.controller";
import { WordSearchEditorController } from "../controllers/word-search-editor.controller";
import { createAuthMiddleware } from "../middlewares/auth.middleware";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { wordSearchRoutes } from "./word-search.routes";
import { roomRoutes } from "./room.routes";
import { createRoomContainer } from "../../di/room.container";
import { createSocialContainer } from "../../di/social.container";
import { friendsRoutes } from "./friends.routes";
import { notificationsRoutes } from "./notifications.routes";
import { env } from "../../../config/env";

export async function registerRoutes(fastify: FastifyInstance) {
  // Repositorios e infraestructura
  const userRepo = new PrismaUserRepository(prismaClient);
  const wordSearchRepo = new PrismaWordSearchRepository(prismaClient);
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService(env.JWT_SECRET, env.JWT_ACCESS_EXPIRY, env.JWT_REFRESH_EXPIRY);
  const sessionCache = new RedisSessionCache(redisClient);
  const catalogCache = new RedisCatalogCache(redisClient);
  const generatorService = new WordSearchGeneratorService();
  const mailService = new NodemailerMailService({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  });

  // Casos de uso
  const registerUseCase = new RegisterUserUseCase(userRepo, hashService, tokenService, mailService, sessionCache);
  const loginUseCase = new LoginUserUseCase(userRepo, hashService, tokenService, sessionCache);
  const guestLoginUseCase = new GuestLoginUseCase(userRepo, hashService, tokenService, sessionCache);
  const forgotPinUseCase = new ForgotPinUseCase(userRepo, mailService, sessionCache);
  const resetPinUseCase = new ResetPinUseCase(userRepo, hashService, mailService, sessionCache);
  const getProfileUseCase = new GetProfileUseCase(userRepo);
  const updateProfileUseCase = new UpdateProfileUseCase(userRepo);
  const updatePinUseCase = new UpdatePinUseCase(userRepo, hashService, mailService);
  const getCatalogListUseCase = new GetCatalogListUseCase(wordSearchRepo, catalogCache);
  const getWordSearchDetailUseCase = new GetWordSearchDetailUseCase(wordSearchRepo);
  const previewUseCase = new PreviewWordSearchUseCase(generatorService);
  const createWordSearchUseCase = new CreateWordSearchUseCase(wordSearchRepo, generatorService, catalogCache);
  const getMyWordSearchesUseCase = new GetMyWordSearchesUseCase(wordSearchRepo);
  const updateWordSearchUseCase = new UpdateWordSearchUseCase(wordSearchRepo, catalogCache);
  const deleteWordSearchUseCase = new DeleteWordSearchUseCase(wordSearchRepo, catalogCache);

  // Controladores y Middlewares
  const authController = new AuthController(registerUseCase, loginUseCase, guestLoginUseCase, forgotPinUseCase, resetPinUseCase);
  const userController = new UserController(getProfileUseCase, updateProfileUseCase, updatePinUseCase);
  const catalogController = new CatalogController(getCatalogListUseCase, getWordSearchDetailUseCase);
  const editorController = new WordSearchEditorController(
    previewUseCase,
    createWordSearchUseCase,
    getMyWordSearchesUseCase,
    updateWordSearchUseCase,
    deleteWordSearchUseCase
  );
  const authMiddleware = createAuthMiddleware(tokenService, sessionCache);

  // Social Container (Épica 5: Amigos, Presencia, Invitaciones y Notificaciones)
  const socialContainer = createSocialContainer({ prisma: prismaClient, redis: redisClient, tokenService, sessionCache });

  // Room Container (Épica 4: Multijugador Realtime)
  const roomContainer = createRoomContainer(prismaClient, redisClient, socialContainer);

  // Registro de rutas con prefijo de API v1
  await fastify.register(authRoutes, { prefix: "/api/v1/auth", authController });
  await fastify.register(userRoutes, { prefix: "/api/v1/users", userController, authMiddleware });
  await fastify.register(wordSearchRoutes, {
    prefix: "/api/v1/word-searches",
    catalogController,
    editorController,
    authMiddleware,
  });
  await fastify.register(roomRoutes, {
    prefix: "/api/v1/rooms",
    roomController: roomContainer.roomController,
    authMiddleware,
  });

  await fastify.register(friendsRoutes, {
    prefix: "/api/v1/friends",
    friendsController: socialContainer.friendsController,
    authMiddleware,
  });
  await fastify.register(notificationsRoutes, {
    prefix: "/api/v1/notifications",
    notificationsController: socialContainer.notificationsController,
    authMiddleware,
  });

  return { socketDispatcher: roomContainer.socketDispatcher };
}
