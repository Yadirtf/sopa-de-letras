import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetFriendsUseCase } from "../../../src/application/use-cases/get-friends.use-case";
import { SearchPlayersUseCase } from "../../../src/application/use-cases/search-players.use-case";
import { GetFriendRequestsUseCase } from "../../../src/application/use-cases/get-friend-requests.use-case";
import { PresenceBroadcaster } from "../../../src/application/services/presence-broadcaster.service";
import { createSocialWorld, profile, befriend } from "./social.fakes";

describe("Lista de amigos y presencia (US-23)", () => {
  let world: ReturnType<typeof createSocialWorld>;
  let presence: any;

  beforeEach(() => {
    world = createSocialWorld([profile("ana", "Ana"), profile("beto", "Beto"), profile("caro", "Caro"), profile("dani", "Dani")]);
    befriend(world, "ana", "beto");
    befriend(world, "ana", "caro");
    befriend(world, "ana", "dani");
    presence = {
      markOnline: vi.fn(),
      heartbeat: vi.fn().mockResolvedValue(true),
      markPlaying: vi.fn().mockResolvedValue(true),
      markBackOnline: vi.fn().mockResolvedValue(true),
      markOffline: vi.fn(),
      getMany: vi.fn().mockResolvedValue(
        new Map([
          ["dani", { status: "ONLINE", roomCode: null }],
          ["caro", { status: "PLAYING", roomCode: "HIVE42" }],
        ])
      ),
    };
  });

  it("ordena: en linea, luego jugando, luego desconectados", async () => {
    const result = await new GetFriendsUseCase(world.friendshipRepo as any, presence).execute("ana");
    const value = result.isSuccess ? result.value : null;

    expect(value?.friends.map((f) => `${f.name}:${f.status}`)).toEqual(["Dani:ONLINE", "Caro:PLAYING", "Beto:OFFLINE"]);
    expect(value?.onlineCount).toBe(2);
    expect(JSON.stringify(value)).not.toContain("HIVE42");
  });

  it("difunde la presencia solo a los amigos", async () => {
    const broadcaster = new PresenceBroadcaster(presence, world.friendshipRepo as any, world.gateway);
    await broadcaster.connected("beto");
    expect(world.gateway.emitToUsers).toHaveBeenCalledWith(["ana"], "friend:presence", { userId: "beto", status: "ONLINE" });

    await broadcaster.joinedRoom("beto", "HIVE42");
    expect(world.gateway.emitToUsers).toHaveBeenLastCalledWith(["ana"], "friend:presence", { userId: "beto", status: "PLAYING" });

    await broadcaster.disconnected("beto");
    expect(presence.markOffline).toHaveBeenCalledWith("beto");
  });

  it("un heartbeat tras expirar vuelve a anunciarse en linea", async () => {
    presence.heartbeat.mockResolvedValue(false);
    const broadcaster = new PresenceBroadcaster(presence, world.friendshipRepo as any, world.gateway);
    await broadcaster.heartbeat("beto");
    expect(presence.markOnline).toHaveBeenCalledWith("beto");
  });

  it("no anuncia PLAYING si el jugador no tiene la app social abierta", async () => {
    presence.markPlaying.mockResolvedValue(false);
    const broadcaster = new PresenceBroadcaster(presence, world.friendshipRepo as any, world.gateway);
    await broadcaster.joinedRoom("beto", "HIVE42");
    expect(world.gateway.emitToUsers).not.toHaveBeenCalled();
  });
});

describe("Busqueda de jugadores (US-22)", () => {
  it("ignora terminos muy cortos y anota la relacion de cada resultado", async () => {
    const world = createSocialWorld([profile("ana", "Ana"), profile("andres", "Andres"), profile("g", "Anabel", true)]);
    world.friendshipRepo.getRelations.mockResolvedValue(new Map([["andres", "REQUEST_RECEIVED"]]));
    const useCase = new SearchPlayersUseCase(world.friendshipRepo as any);

    const short = await useCase.execute("ana", "a");
    const result = await useCase.execute("ana", "an");

    expect(short.isSuccess && short.value).toEqual([]);
    expect(result.isSuccess && result.value).toEqual([
      { id: "andres", name: "Andres", avatarUrl: "bee_scout", isGuest: false, relation: "REQUEST_RECEIVED" },
    ]);
  });

  it("lista solicitudes entrantes y salientes con fechas ISO", async () => {
    const world = createSocialWorld([]);
    const view = { id: "r1", createdAt: new Date("2026-10-01T00:00:00Z"), player: { id: "b", name: "Beto", avatarUrl: null } };
    world.requestRepo.listIncoming.mockResolvedValue([view] as any);
    const result = await new GetFriendRequestsUseCase(world.requestRepo as any).execute("ana");
    expect(result.isSuccess && result.value.incoming[0].createdAt).toBe("2026-10-01T00:00:00.000Z");
    expect(result.isSuccess && result.value.outgoing).toEqual([]);
  });
});
