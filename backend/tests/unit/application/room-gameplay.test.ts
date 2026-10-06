import { describe, it, expect, vi } from "vitest";
import { WordValidationHelper } from "../../../src/application/services/word-validation.helper";
import { RoomManagerService } from "../../../src/application/services/room-manager.service";
import { RedisRoomCache, CachedRoomState } from "../../../src/infrastructure/cache/redis-room.cache";

describe("WordValidationHelper & RoomManagerService", () => {
  it("debe validar geometría en línea recta horizontal, vertical y diagonal", () => {
    // Horizontal (0,0) a (0,3) -> length 4
    expect(WordValidationHelper.isValidStraightLine([0, 0], [0, 3], 4)).toBe(true);
    // Vertical (1,2) a (4,2) -> length 4
    expect(WordValidationHelper.isValidStraightLine([1, 2], [4, 2], 4)).toBe(true);
    // Diagonal (0,0) a (3,3) -> length 4
    expect(WordValidationHelper.isValidStraightLine([0, 0], [3, 3], 4)).toBe(true);
    // Trazo no recto en L
    expect(WordValidationHelper.isValidStraightLine([0, 0], [2, 3], 4)).toBe(false);
  });

  it("debe extraer palabra de cuadrícula", () => {
    const grid = [
      ["H", "O", "L", "A"],
      ["A", "B", "C", "D"],
      ["X", "Y", "Z", "W"],
      ["P", "Q", "R", "S"],
    ];
    const word = WordValidationHelper.extractWordFromGrid(grid, [0, 0], [0, 3]);
    expect(word).toBe("HOLA");
  });

  it("debe gestionar unión de jugadores y reclamo de palabras en RoomManagerService", async () => {
    const mockRedis = {
      set: vi.fn().mockResolvedValue("OK"),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn().mockResolvedValue(1),
    } as any;

    const cache = new RedisRoomCache(mockRedis);
    const service = new RoomManagerService(cache);

    const initialRoom: CachedRoomState = {
      id: "room-1",
      code: "CODE12",
      wordSearchId: "ws-1",
      wordSearchTitle: "Frutas",
      hostUserId: "host-1",
      status: "WAITING",
      maxPlayers: 4,
      timeLimitSeconds: 180,
      isPrivate: false,
      grid: [
        ["M", "A", "N", "Z", "A", "N", "A"],
        ["X", "X", "X", "X", "X", "X", "X"],
      ],
      words: ["MANZANA"],
      solutions: {
        MANZANA: { start: [0, 0], end: [0, 6], word: "MANZANA" },
      },
      players: [
        {
          userId: "host-1",
          username: "Host",
          isHost: true,
          isReady: true,
          score: 0,
          wordsFound: [],
          colorHex: "#7C3AED",
        },
      ],
      claimedWords: {},
      rematchVotes: [],
    };

    await cache.saveRoom(initialRoom);

    // Unir segundo jugador
    const { state: stateAfterJoin, joinedPlayer } = await service.addPlayer("CODE12", {
      userId: "guest-2",
      username: "Guest",
    });
    expect(stateAfterJoin.players).toHaveLength(2);
    expect(joinedPlayer.userId).toBe("guest-2");

    // Iniciar partida
    stateAfterJoin.status = "IN_PROGRESS";
    await cache.saveRoom(stateAfterJoin);

    // Enviar palabra válida
    const { wordFound, allCompleted } = await service.submitWord("CODE12", "guest-2", "MANZANA", {
      start: [0, 0],
      end: [0, 6],
    });

    expect(wordFound.word).toBe("MANZANA");
    expect(wordFound.pointsAwarded).toBeGreaterThan(100);
    expect(allCompleted).toBe(true);

    // Intentar reclamar la misma palabra por el mismo jugador debe arrojar error
    await expect(
      service.submitWord("CODE12", "guest-2", "MANZANA", { start: [0, 0], end: [0, 6] })
    ).rejects.toThrow("PALABRA_YA_ENCONTRADA");
  });

  it("CreateRoomUseCase debe admitir palabras guardadas como objetos PlacedWord y strings sin fallar con toUpperCase", async () => {
    const { CreateRoomUseCase } = await import("../../../src/application/use-cases/create-room.use-case");
    const mockRoomRepo = { create: vi.fn().mockResolvedValue(undefined) } as any;
    const mockWordSearchRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "ws-test-1",
        title: "Animales",
        grid: [["L", "E", "O", "N"]],
        words: [
          { word: "LEON", startRow: 0, startCol: 0, endRow: 0, endCol: 3, direction: "RIGHT" },
          "TIGRE",
        ],
      }),
    } as any;
    const mockCache = { saveRoom: vi.fn().mockResolvedValue(undefined) } as any;

    const useCase = new CreateRoomUseCase(mockRoomRepo, mockWordSearchRepo, mockCache);
    const result = await useCase.execute(
      { id: "user-1", name: "Host" },
      { wordSearchId: "ws-test-1", maxPlayers: 10, timeLimitSeconds: 120 }
    );

    expect(result.code).toHaveLength(6);
    expect(result.maxPlayers).toBe(10);
    expect(mockRoomRepo.create).toHaveBeenCalledOnce();
    expect(mockCache.saveRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        words: ["LEON", "TIGRE"],
      })
    );
  });
});
