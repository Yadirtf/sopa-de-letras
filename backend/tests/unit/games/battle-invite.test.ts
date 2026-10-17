import { describe, it, expect, vi } from "vitest";
import { BattleLobbyService } from "../../../src/games/battle/application/battle-lobby.service";
import { BattleLock } from "../../../src/games/battle/application/battle-lock";
import { BattleRoomReader } from "../../../src/games/battle/application/battle-room-reader";
import { InMemoryBattleMatchStore } from "../../../src/games/battle/infrastructure/redis-battle-match.store";
import { InviteFriendToRoomUseCase } from "../../../src/application/use-cases/invite-friend-to-room.use-case";
import { NotificationDispatcher } from "../../../src/application/services/notification-dispatcher.service";
import { createSocialWorld, profile, befriend } from "../application/social.fakes";

const smallArmy = { cols: 8, rows: 8, terrain: "SKY", army: { paratrooper: 1, balloon: 1 } };

function setup() {
  const store = new InMemoryBattleMatchStore();
  const lobby = new BattleLobbyService(store, new BattleLock());
  const reader = new BattleRoomReader(store);
  const world = createSocialWorld([profile("ana", "Ana"), profile("beto", "Beto")]);
  befriend(world, "ana", "beto");
  const wordSearchRooms = { getRoom: vi.fn(async () => null) };
  const useCase = new InviteFriendToRoomUseCase(
    world.friendshipRepo as any,
    { getRoom: (code, game) => (game === "battle" ? reader.getRoom(code) : wordSearchRooms.getRoom()) },
    { tryAcquire: vi.fn().mockResolvedValue(true) },
    new NotificationDispatcher(world.notificationRepo as any, world.gateway, () => "n1"),
    world.gateway,
    () => 1_000
  );
  return { lobby, reader, world, useCase };
}

describe("Retar a un amigo a La Batalla Más Temida", () => {
  it("la sala de batalla se ve como sala invitable con terreno y arena", async () => {
    const { lobby, reader } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    expect(await reader.getRoom(match.code.toLowerCase())).toEqual({
      code: match.code,
      wordSearchTitle: "Cielo · Arena 8 × 8",
      hostUserId: "ana",
      status: "WAITING",
      maxPlayers: 2,
      players: [{ userId: "ana" }],
    });
  });

  it("envia el reto al amigo marcado como batalla", async () => {
    const { lobby, useCase, world } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    const result = await useCase.execute("ana", "beto", match.code, "battle");

    expect(result.isSuccess).toBe(true);
    expect(world.gateway.emitToUser).toHaveBeenCalledWith(
      "beto",
      "room:invite_received",
      expect.objectContaining({ game: "battle", roomCode: match.code, fromName: "Ana" })
    );
    expect(world.notifications[0].payload).toMatchObject({ game: "battle", roomCode: match.code });
  });

  it("no busca el codigo de batalla entre las salas de la sopa", async () => {
    const { lobby, useCase } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    const result = await useCase.execute("ana", "beto", match.code);
    expect(result.isFailure && result.error.code).toBe("ROOM_NOT_JOINABLE");
  });

  it("no se puede retar si la sala es contra la Abejita o ya empezo", async () => {
    const { lobby, useCase } = setup();
    const bot = await lobby.create({ id: "ana", name: "Ana" }, { ...smallArmy, opponent: "BOT" });
    expect((await useCase.execute("ana", "beto", bot.code, "battle")).isFailure).toBe(true);
  });
});
