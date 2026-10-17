import { FastifyReply, FastifyRequest } from "fastify";
import { battleLinks } from "../../../application/common/room-links";
import { GAMES } from "../../games.catalog";
import { ARENA_LIMITS, MAX_COVERAGE, armyCellCount, recommendArmy } from "../domain/battle-config";
import { BattleError } from "../domain/battle-errors";
import { BATTLE_TERRAINS, findTerrain } from "../domain/battle-terrains.catalog";
import { BATTLE_WEAPONS, MAX_WEAPON_USES } from "../domain/battle-weapons";
import { BattleLobbyService } from "../application/battle-lobby.service";
import { PrismaBattleUserDirectory } from "../infrastructure/prisma-battle.adapters";
import { publicPlayer } from "../application/battle-views";

/** HTTP de la batalla: catalogo (terrenos, figuras, armas), recomendacion y salas. */
export class BattleController {
  constructor(
    private readonly lobby: BattleLobbyService,
    private readonly users: PrismaBattleUserDirectory
  ) {}

  games = async (_req: FastifyRequest, reply: FastifyReply) => reply.send({ status: "success", data: GAMES });

  catalog = async (_req: FastifyRequest, reply: FastifyReply) =>
    reply.send({
      status: "success",
      data: {
        terrains: BATTLE_TERRAINS,
        weapons: BATTLE_WEAPONS,
        limits: { ...ARENA_LIMITS, maxWeaponUses: MAX_WEAPON_USES, maxCoverage: MAX_COVERAGE },
      },
    });

  recommendation = async (req: FastifyRequest, reply: FastifyReply) => {
    const q = req.query as Record<string, string>;
    const terrain = findTerrain(q.terrain) ?? BATTLE_TERRAINS[0];
    const cols = Math.min(Math.max(Number(q.cols) || 20, ARENA_LIMITS.minCols), ARENA_LIMITS.maxCols);
    const rows = Math.min(Math.max(Number(q.rows) || 15, ARENA_LIMITS.minRows), ARENA_LIMITS.maxRows);
    const army = recommendArmy(terrain, cols, rows);
    return reply.send({ status: "success", data: { army, occupiedCells: armyCellCount(terrain, army) } });
  };

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user?.userId;
    if (!userId) return reply.status(401).send({ error: "No autorizado" });
    try {
      const host = (await this.users.find(userId)) ?? { id: userId, name: "Jugador" };
      const match = await this.lobby.create(host, (req.body ?? {}) as Record<string, unknown>);
      return reply.status(201).send({ status: "success", data: { code: match.code, config: match.config, ...battleLinks(match.code) } });
    } catch (err) {
      return this.fail(reply, err);
    }
  };

  /** Datos publicos para la pantalla de "Unirme" (sin tableros). */
  getByCode = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const match = await this.lobby.require((req.params as { code: string }).code);
      return reply.send({
        status: "success",
        data: {
          code: match.code,
          status: match.status,
          config: match.config,
          hostUserId: match.hostUserId,
          players: match.players.map(publicPlayer),
          ...battleLinks(match.code),
        },
      });
    } catch (err) {
      return this.fail(reply, err, 404);
    }
  };

  private fail(reply: FastifyReply, err: unknown, status = 400) {
    if (err instanceof BattleError) return reply.status(status).send({ error: err.message, message: err.message, code: err.code });
    return reply.status(500).send({ message: "No pudimos crear la batalla. Inténtalo de nuevo." });
  }
}
