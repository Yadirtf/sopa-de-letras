import { describe, it, expect, beforeEach } from "vitest";
import { RoomManagerService } from "../../../src/application/services/room-manager.service";
import { RoomLifecycleService, RoomFlowError } from "../../../src/application/services/room-lifecycle.service";
import { RedisRoomCache, CachedRoomState } from "../../../src/infrastructure/cache/redis-room.cache";

/** Redis falso que serializa como el real: cada get() devuelve una copia nueva. */
function fakeRedis() {
  const store = new Map<string, string>();
  return {
    set: async (k: string, v: string) => { store.set(k, v); return "OK"; },
    get: async (k: string) => store.get(k) ?? null,
    del: async (k: string) => { store.delete(k); return 1; },
  } as any;
}

function baseRoom(): CachedRoomState {
  return {
    id: "room-1", code: "ABC123", wordSearchId: "ws-1", wordSearchTitle: "Frutas",
    hostUserId: "host", status: "WAITING", maxPlayers: 3, timeLimitSeconds: 60, isPrivate: false,
    grid: [["A"]], words: ["A"], solutions: {}, claimedWords: {}, rematchVotes: [],
    players: [{ userId: "host", username: "Ana", isHost: true, isReady: true, score: 0, wordsFound: [], colorHex: "#7C3AED" }],
  };
}

describe("Flujo del lobby (listo e iniciar)", () => {
  let cache: RedisRoomCache;
  let manager: RoomManagerService;
  let lifecycle: RoomLifecycleService;

  beforeEach(async () => {
    cache = new RedisRoomCache(fakeRedis());
    manager = new RoomManagerService(cache);
    lifecycle = new RoomLifecycleService(cache);
    await cache.saveRoom(baseRoom());
    await manager.addPlayer("ABC123", { userId: "guest", username: "Beto" });
  });

  it("un invitado entra sin estar listo y puede marcar y cancelar listo", async () => {
    expect((await cache.getRoom("ABC123"))!.players[1].isReady).toBe(false);
    await lifecycle.setReady("ABC123", "guest", true);
    expect((await cache.getRoom("ABC123"))!.players[1].isReady).toBe(true);
    await lifecycle.setReady("ABC123", "guest", false);
    expect((await cache.getRoom("ABC123"))!.players[1].isReady).toBe(false);
  });

  it("el anfitrion siempre queda listo", async () => {
    const state = await lifecycle.setReady("ABC123", "host", false);
    expect(state.players[0].isReady).toBe(true);
  });

  it("no deja iniciar si falta alguien por estar listo y dice quien", async () => {
    await expect(lifecycle.beginCountdown("ABC123", "host")).rejects.toMatchObject({
      code: "JUGADORES_NO_LISTOS",
      message: expect.stringContaining("Beto"),
    });
  });

  it("solo el anfitrion puede iniciar", async () => {
    await lifecycle.setReady("ABC123", "guest", true);
    await expect(lifecycle.beginCountdown("ABC123", "guest")).rejects.toBeInstanceOf(RoomFlowError);
  });

  it("iniciar guarda COUNTDOWN y luego IN_PROGRESS en la cache (antes se perdia con Redis)", async () => {
    await lifecycle.setReady("ABC123", "guest", true);
    await lifecycle.beginCountdown("ABC123", "host");
    expect((await cache.getRoom("ABC123"))!.status).toBe("COUNTDOWN");

    const playing = await lifecycle.startPlaying("ABC123");
    expect(playing).not.toBeNull();
    const saved = await cache.getRoom("ABC123");
    expect(saved!.status).toBe("IN_PROGRESS");
    expect(saved!.endsAt).toBe(saved!.startedAt! + 60_000);
  });

  it("un doble toque en Iniciar no arranca dos cuentas atras", async () => {
    await lifecycle.setReady("ABC123", "guest", true);
    await lifecycle.beginCountdown("ABC123", "host");
    await expect(lifecycle.beginCountdown("ABC123", "host")).rejects.toMatchObject({ code: "PARTIDA_EN_CURSO" });
  });

  it("un jugador que reconecta en plena partida recupera su puesto", async () => {
    await lifecycle.setReady("ABC123", "guest", true);
    await lifecycle.beginCountdown("ABC123", "host");
    await lifecycle.startPlaying("ABC123");
    const { state } = await manager.addPlayer("ABC123", { userId: "guest", username: "Beto" });
    expect(state.players).toHaveLength(2);
    await expect(manager.addPlayer("ABC123", { userId: "nuevo", username: "Cora" })).rejects.toThrow("PARTIDA_EN_CURSO");
  });

  it("si el anfitrion sale, el nuevo anfitrion queda listo", async () => {
    const { newHostId, state } = await manager.removePlayer("ABC123", "host");
    expect(newHostId).toBe("guest");
    expect(state.players[0]).toMatchObject({ isHost: true, isReady: true });
  });
});
