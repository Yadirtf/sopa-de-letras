import { IRoomStateReader, LiveRoomSnapshot } from "../../../domain/services/room-state-reader.interface";
import { findTerrain } from "../domain/battle-terrains.catalog";
import { BattleMatch } from "../domain/battle-match.types";
import { BattleMatchStore } from "./battle-ports";

const STATUS: Record<BattleMatch["status"], LiveRoomSnapshot["status"]> = {
  WAITING: "WAITING",
  PLACING: "IN_PROGRESS",
  PLAYING: "IN_PROGRESS",
  FINISHED: "FINISHED",
};

/**
 * Lo unico que el modulo social ve de una batalla para invitar a un amigo:
 * quien esta dentro, si aun espera rival y un titulo para el aviso.
 * La Abejita cuenta como jugador, asi que una sala contra ella sale llena.
 */
export class BattleRoomReader implements IRoomStateReader {
  constructor(private readonly store: BattleMatchStore) {}

  async getRoom(code: string): Promise<LiveRoomSnapshot | null> {
    const match = await this.store.get(code.toUpperCase());
    if (!match) return null;
    const terrain = findTerrain(match.config.terrain);
    return {
      code: match.code,
      wordSearchTitle: `${terrain?.name ?? "Batalla"} · Arena ${match.config.cols} × ${match.config.rows}`,
      hostUserId: match.hostUserId,
      status: STATUS[match.status],
      maxPlayers: 2,
      players: match.players.map((p) => ({ userId: p.userId })),
    };
  }
}
