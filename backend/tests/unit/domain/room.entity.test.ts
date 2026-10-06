import { describe, it, expect } from "vitest";
import { RoomEntity } from "../../../src/domain/entities/room.entity";

describe("RoomEntity", () => {
  it("debe crear una entidad de sala válida", () => {
    const room = RoomEntity.create({
      id: "room-123",
      code: "HIVE92",
      wordSearchId: "ws-1",
      hostUserId: "user-1",
      status: "WAITING",
      maxPlayers: 4,
      timeLimitSeconds: 180,
      isPrivate: false,
      players: [
        {
          userId: "user-1",
          username: "HostPlayer",
          isHost: true,
          isReady: true,
          score: 0,
          wordsFound: [],
          colorHex: "#7C3AED",
        },
      ],
      createdAt: new Date(),
    });

    expect(room.id).toBe("room-123");
    expect(room.code).toBe("HIVE92");
    expect(room.canJoin()).toBe(true);
    expect(room.isHost("user-1")).toBe(true);
    expect(room.isHost("user-2")).toBe(false);
  });

  it("debe rechazar código inválido o maxPlayers fuera de rango", () => {
    expect(() =>
      RoomEntity.create({
        id: "room-1",
        code: "NO",
        wordSearchId: "ws-1",
        hostUserId: "user-1",
        status: "WAITING",
        maxPlayers: 4,
        timeLimitSeconds: 180,
        isPrivate: false,
        players: [],
        createdAt: new Date(),
      })
    ).toThrow("El código de sala debe tener al menos 4 caracteres");

    expect(() =>
      RoomEntity.create({
        id: "room-1",
        code: "HIVE92",
        wordSearchId: "ws-1",
        hostUserId: "user-1",
        status: "WAITING",
        maxPlayers: 12,
        timeLimitSeconds: 180,
        isPrivate: false,
        players: [],
        createdAt: new Date(),
      })
    ).toThrow("La capacidad de jugadores debe estar entre 2 y 8");
  });

  it("debe cambiar de estado al iniciar y finalizar", () => {
    const room = RoomEntity.create({
      id: "room-1",
      code: "HIVE92",
      wordSearchId: "ws-1",
      hostUserId: "user-1",
      status: "WAITING",
      maxPlayers: 4,
      timeLimitSeconds: 180,
      isPrivate: false,
      players: [],
      createdAt: new Date(),
    });

    room.start();
    expect(room.status).toBe("IN_PROGRESS");
    expect(room.startedAt).toBeDefined();

    room.finish();
    expect(room.status).toBe("FINISHED");
    expect(room.endedAt).toBeDefined();
  });
});
