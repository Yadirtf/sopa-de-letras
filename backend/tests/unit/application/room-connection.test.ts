import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RoomManagerService } from "../../../src/application/services/room-manager.service";
import { RoomConnectionService } from "../../../src/application/services/room-connection.service";
import { RedisRoomCache, CachedRoomState } from "../../../src/infrastructure/cache/redis-room.cache";

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
    id: "room-1", code: "ABC123", wordSearchId: "ws-1", wordSearchTitle: "Animales",
    hostUserId: "host", status: "WAITING", maxPlayers: 4, timeLimitSeconds: null, isPrivate: false,
    grid: [["P", "E", "R", "R", "O"]], words: ["PERRO"], solutions: {}, claimedWords: {}, rematchVotes: [],
    players: [{ userId: "host", username: "Ana", isHost: true, isReady: true, score: 0, wordsFound: [], colorHex: "#7C3AED" }],
  };
}

describe("Caidas de internet en la sala", () => {
  let cache: RedisRoomCache;
  let manager: RoomManagerService;
  let connection: RoomConnectionService;

  beforeEach(async () => {
    cache = new RedisRoomCache(fakeRedis());
    manager = new RoomManagerService(cache);
    connection = new RoomConnectionService(cache, 1_000);
    await cache.saveRoom(baseRoom());
    await manager.addPlayer("ABC123", { userId: "beto", username: "Beto" });
  });

  afterEach(() => vi.useRealTimers());

  it("perder la conexion marca al jugador sin sacarlo de la sala", async () => {
    const state = await connection.markDisconnected("ABC123", "beto");
    expect(state!.players.map((p) => p.userId)).toEqual(["host", "beto"]);
    expect(state!.players[1].isConnected).toBe(false);
    // Una segunda caida no vuelve a avisar.
    expect(await connection.markDisconnected("ABC123", "beto")).toBeNull();
  });

  it("al reconectar recupera su puesto y queda conectado", async () => {
    await connection.markDisconnected("ABC123", "beto");
    const { state } = await manager.addPlayer("ABC123", { userId: "beto", username: "Beto" });
    expect(state.players).toHaveLength(2);
    expect(state.players[1].isConnected).toBe(true);
    expect(await connection.shouldRelease("ABC123", "beto")).toBe(false);
  });

  it("en el lobby se libera el puesto solo si no vuelve dentro de la gracia", async () => {
    vi.useFakeTimers();
    const expired = vi.fn(async () => undefined);
    await connection.markDisconnected("ABC123", "beto");
    connection.scheduleRelease("ABC123", "beto", expired);

    vi.advanceTimersByTime(999);
    expect(expired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(await connection.shouldRelease("ABC123", "beto")).toBe(true);
  });

  it("una caida nueva reinicia el plazo en vez de duplicarlo", async () => {
    vi.useFakeTimers();
    const expired = vi.fn(async () => undefined);
    connection.scheduleRelease("ABC123", "beto", expired);
    vi.advanceTimersByTime(600);
    connection.scheduleRelease("ABC123", "beto", expired);
    vi.advanceTimersByTime(600);
    expect(expired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("en plena partida nunca se saca a quien se quedo sin internet", async () => {
    const room = (await cache.getRoom("ABC123"))!;
    room.status = "IN_PROGRESS";
    await cache.saveRoom(room);
    await connection.markDisconnected("ABC123", "beto");
    expect(await connection.shouldRelease("ABC123", "beto")).toBe(false);
  });

  it("la palabra reclamada guarda sus coordenadas para repintarla al reconectar", async () => {
    const room = (await cache.getRoom("ABC123"))!;
    room.status = "IN_PROGRESS";
    await cache.saveRoom(room);
    await manager.submitWord("ABC123", "beto", "PERRO", { start: [0, 0], end: [0, 4] });
    const claim = (await cache.getRoom("ABC123"))!.claimedWords.PERRO;
    expect(claim.start).toEqual([0, 0]);
    expect(claim.end).toEqual([0, 4]);
  });
});
