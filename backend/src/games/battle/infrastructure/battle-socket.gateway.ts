import { Namespace, Server, Socket } from "socket.io";
import { ITokenService } from "../../../domain/services/token.service.interface";
import { ISessionCacheService } from "../../../domain/services/session-cache.interface";
import { BattleError } from "../domain/battle-errors";
import { BattleMatch, ShotReport } from "../domain/battle-match.types";
import { BattleLobbyService } from "../application/battle-lobby.service";
import { BattlePlayService } from "../application/battle-play.service";
import { BattleNotifier } from "../application/battle-ports";
import { viewFor } from "../application/battle-views";
import { PrismaBattleUserDirectory } from "./prisma-battle.adapters";

type Ack = (reply: Record<string, unknown>) => void;
const playerChannel = (code: string, userId: string) => `battle:${code.toUpperCase()}:${userId}`;

/**
 * Socket propio de la batalla: el espacio `/battle`, separado del de la sopa.
 * El jugador se identifica con su JWT en el handshake; nunca se confia en un
 * userId que mande el cliente. Cada jugador escucha su canal privado y recibe
 * `state` con SU vista de la batalla.
 */
export class BattleSocketGateway implements BattleNotifier {
  private namespace: Namespace | null = null;

  constructor(
    private readonly tokenService: ITokenService,
    private readonly sessionCache: ISessionCacheService,
    private readonly users: PrismaBattleUserDirectory,
    private readonly lobby: BattleLobbyService,
    private readonly play: () => BattlePlayService
  ) {}

  publish(match: BattleMatch, shot?: ShotReport): void {
    for (const player of match.players.filter((p) => !p.isBot)) {
      this.namespace?.to(playerChannel(match.code, player.userId)).emit("state", { view: viewFor(match, player.userId), shot });
    }
  }

  attach(io: Server): void {
    this.namespace = io.of("/battle");
    this.namespace.use((socket, next) => {
      this.authenticate(socket).then((ok) => next(ok ? undefined : new Error("SESION_EXPIRADA")), () => next(new Error("SESION_EXPIRADA")));
    });
    this.namespace.on("connection", (socket) => this.register(socket));
  }

  private async authenticate(socket: Socket): Promise<boolean> {
    const token = socket.handshake.auth?.token;
    const payload = typeof token === "string" ? this.tokenService.verifyAccessToken(token) : null;
    if (!payload || !(await this.sessionCache.getSession(payload.userId))) return false;
    socket.data.userId = payload.userId;
    return true;
  }

  private register(socket: Socket): void {
    const userId: string = socket.data.userId;
    const on = (event: string, handler: (payload: any) => Promise<Record<string, unknown>>) =>
      socket.on(event, (payload: any, ack?: Ack) => {
        handler(payload ?? {})
          .then((data) => ack?.({ ok: true, ...data }))
          .catch((err) => ack?.(this.errorReply(err)));
      });

    on("join", async ({ code }) => {
      const user = (await this.users.find(userId)) ?? { id: userId, name: "Jugador" };
      const match = await this.lobby.join(String(code), user);
      await socket.join(playerChannel(match.code, userId));
      this.publish(match);
      void this.play().resume(match.code);
      return { view: viewFor(match, userId) };
    });
    on("random-layout", async ({ code }) => ({ units: await this.play().randomLayout(String(code), userId) }));
    on("place", async ({ code, units }) => {
      await this.play().place(String(code), userId, Array.isArray(units) ? units : []);
      return {};
    });
    on("shoot", async ({ code, weapon, col, row }) => ({
      shot: await this.play().shoot(String(code), userId, String(weapon), Number(col), Number(row)),
    }));
    on("rematch", async ({ code }) => {
      await this.play().rematch(String(code), userId);
      return {};
    });
    on("leave", async ({ code }) => {
      await this.play().leave(String(code), userId);
      await socket.leave(playerChannel(String(code), userId));
      return {};
    });
  }

  private errorReply(err: unknown): Record<string, unknown> {
    if (err instanceof BattleError) return { ok: false, code: err.code, message: err.message };
    return { ok: false, code: "ERROR_DESCONOCIDO", message: "No pudimos completar la acción. Inténtalo de nuevo." };
  }
}
