import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationDispatcher } from "../../../src/application/services/notification-dispatcher.service";
import { ListNotificationsUseCase } from "../../../src/application/use-cases/list-notifications.use-case";
import { MarkNotificationsReadUseCase } from "../../../src/application/use-cases/mark-notifications-read.use-case";
import { createSocialWorld } from "./social.fakes";

describe("Centro de notificaciones (US-25)", () => {
  let world: ReturnType<typeof createSocialWorld>;
  let dispatcher: NotificationDispatcher;
  let ids = 0;

  beforeEach(() => {
    world = createSocialWorld([]);
    dispatcher = new NotificationDispatcher(world.notificationRepo as any, world.gateway, () => `n${++ids}`);
  });

  it("persiste y empuja notification:new con el contador de no leidas", async () => {
    const dto = await dispatcher.notify({ recipientId: "ana", type: "GAME_END", payload: { rank: 1 } });

    expect(dto?.isRead).toBe(false);
    expect(world.gateway.emitToUser).toHaveBeenCalledWith("ana", "notification:new", { notification: dto, unreadCount: 1 });
  });

  it("nunca rompe la accion que la origino si la BD falla", async () => {
    world.notificationRepo.create.mockRejectedValueOnce(new Error("FK"));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(dispatcher.notify({ recipientId: "fantasma", type: "GAME_END", payload: {} })).resolves.toBeNull();
    expect(world.gateway.emitToUser).not.toHaveBeenCalled();
  });

  it("lista con contador y limita el tamano de pagina", async () => {
    await dispatcher.notify({ recipientId: "ana", type: "FRIEND_REQUEST", payload: {} });
    const result = await new ListNotificationsUseCase(world.notificationRepo as any).execute("ana", 500);

    expect(world.notificationRepo.listForRecipient).toHaveBeenCalledWith("ana", 50, undefined);
    expect(result.isSuccess && result.value.unreadCount).toBe(1);
    expect(result.isSuccess && typeof result.value.items[0].createdAt).toBe("string");
  });

  it("marca una como leida y devuelve el nuevo contador", async () => {
    const dto = await dispatcher.notify({ recipientId: "ana", type: "FRIEND_REQUEST", payload: {} });
    const result = await new MarkNotificationsReadUseCase(world.notificationRepo as any).markOne("ana", dto!.id);

    expect(world.notificationRepo.markRead).toHaveBeenCalledWith(dto!.id);
    expect(result.isSuccess && result.value.unreadCount).toBe(0);
  });

  it("no deja leer notificaciones ajenas", async () => {
    const dto = await dispatcher.notify({ recipientId: "ana", type: "FRIEND_REQUEST", payload: {} });
    const result = await new MarkNotificationsReadUseCase(world.notificationRepo as any).markOne("beto", dto!.id);
    expect(result.isFailure && result.error.statusCode).toBe(404);
  });

  it("marca todas como leidas", async () => {
    world.notificationRepo.markAllRead.mockResolvedValue(3);
    const result = await new MarkNotificationsReadUseCase(world.notificationRepo as any).markAll("ana");
    expect(result.isSuccess && result.value).toEqual({ updated: 3, unreadCount: 0 });
  });
});
