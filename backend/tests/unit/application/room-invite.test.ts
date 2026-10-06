import { describe, it, expect, beforeEach, vi } from "vitest";
import { InviteFriendToRoomUseCase } from "../../../src/application/use-cases/invite-friend-to-room.use-case";
import { NotificationDispatcher } from "../../../src/application/services/notification-dispatcher.service";
import { LiveRoomSnapshot } from "../../../src/domain/services/room-state-reader.interface";
import { createSocialWorld, profile, befriend } from "./social.fakes";

describe("Invitaciones directas a sala (US-24)", () => {
  let world: ReturnType<typeof createSocialWorld>;
  let room: LiveRoomSnapshot;
  let cooldown: { tryAcquire: ReturnType<typeof vi.fn> };
  let useCase: InviteFriendToRoomUseCase;

  beforeEach(() => {
    world = createSocialWorld([profile("ana", "Ana"), profile("beto", "Beto")]);
    befriend(world, "ana", "beto");
    room = { code: "HIVE42", wordSearchTitle: "Animales", hostUserId: "ana", status: "WAITING", maxPlayers: 4, players: [{ userId: "ana" }] };
    cooldown = { tryAcquire: vi.fn().mockResolvedValue(true) };
    const dispatcher = new NotificationDispatcher(world.notificationRepo as any, world.gateway, () => "n1");
    useCase = new InviteFriendToRoomUseCase(
      world.friendshipRepo as any,
      { getRoom: vi.fn(async (code: string) => (code === room.code ? room : null)) },
      cooldown,
      dispatcher,
      world.gateway,
      () => 1_000
    );
  });

  it("envia room:invite_received al canal privado del amigo con 15 s de vida", async () => {
    const result = await useCase.execute("ana", "beto", "hive42");

    expect(result.isSuccess && result.value).toEqual({ invitedUserId: "beto", expiresAt: 16_000 });
    expect(world.gateway.emitToUser).toHaveBeenCalledWith(
      "beto",
      "room:invite_received",
      expect.objectContaining({ roomCode: "HIVE42", fromName: "Ana", wordSearchTitle: "Animales", notificationId: "n1" })
    );
    expect(world.notifications[0].type).toBe("ROOM_INVITE");
    expect(cooldown.tryAcquire).toHaveBeenCalledWith("invite:cooldown:HIVE42:beto", 15);
  });

  it("solo se puede invitar a amigos", async () => {
    world.friendships.clear();
    const result = await useCase.execute("ana", "beto", "HIVE42");
    expect(result.isFailure && result.error.code).toBe("NOT_FRIENDS");
  });

  it.each([
    ["sala inexistente", () => (room.code = "OTRA"), "ROOM_NOT_JOINABLE"],
    ["partida empezada", () => (room.status = "IN_PROGRESS"), "ROOM_NOT_JOINABLE"],
    ["sala llena", () => (room.maxPlayers = 1), "ROOM_NOT_JOINABLE"],
    ["amigo ya dentro", () => room.players.push({ userId: "beto" }), "ROOM_NOT_JOINABLE"],
    ["invitador fuera de la sala", () => (room.players = [{ userId: "x" }]), "SOCIAL_ACTION_FORBIDDEN"],
  ])("rechaza la invitacion: %s", async (_label, mutate, code) => {
    mutate();
    const result = await useCase.execute("ana", "beto", "HIVE42");
    expect(result.isFailure && result.error.code).toBe(code);
    expect(world.gateway.emitToUser).not.toHaveBeenCalled();
  });

  it("evita el spam de invitaciones repetidas", async () => {
    cooldown.tryAcquire.mockResolvedValue(false);
    const result = await useCase.execute("ana", "beto", "HIVE42");
    expect(result.isFailure && result.error.statusCode).toBe(429);
  });
});
