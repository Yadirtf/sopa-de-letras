import { describe, it, expect, beforeEach, vi } from "vitest";
import { INVITE_PUSH_TTL_MS, PushNotifier } from "../../../src/application/services/push-notifier.service";
import { NotificationDispatcher } from "../../../src/application/services/notification-dispatcher.service";
import { ManagePushDeviceUseCase } from "../../../src/application/use-cases/manage-push-device.use-case";
import { createSocialWorld } from "./social.fakes";

function createDevices(initial: Record<string, string[]> = {}) {
  const byUser = new Map(Object.entries(initial));
  return {
    upsert: vi.fn(async (userId: string, token: string) => void byUser.set(userId, [...(byUser.get(userId) ?? []), token])),
    removeForUser: vi.fn(async () => undefined),
    removeTokens: vi.fn(async () => undefined),
    listTokens: vi.fn(async (userId: string) => byUser.get(userId) ?? []),
  };
}

const sender = (invalidTokens: string[] = []) => ({ enabled: true, send: vi.fn(async () => ({ invalidTokens })) });

describe("Avisos push en la barra del telefono", () => {
  let devices: ReturnType<typeof createDevices>;

  beforeEach(() => {
    devices = createDevices({ ana: ["tok-1", "tok-2"] });
  });

  it("envia la invitacion a todos los telefonos con datos para unirse y la mantiene viva un buen rato", async () => {
    const fcm = sender();
    await new PushNotifier(devices, fcm).push({
      id: "n1",
      recipientId: "ana",
      type: "ROOM_INVITE",
      payload: { roomCode: "ABC123", fromName: "Beto", wordSearchTitle: "Animales", expiresAt: 1_120_000 },
    });

    expect(fcm.send).toHaveBeenCalledWith(["tok-1", "tok-2"], {
      title: "🎮 Beto te invita a jugar",
      body: "Animales · Sala ABC123. ¡Toca para unirte!",
      tag: "invite-ABC123",
      // El banner dura 15 s, pero el telefono puede estar en reposo: FCM no debe tirarla.
      ttlMs: INVITE_PUSH_TTL_MS,
      data: expect.objectContaining({ type: "ROOM_INVITE", notificationId: "n1", roomCode: "ABC123", expiresAt: String(1_120_000) }),
    });
  });

  it("avisa de solicitudes de amistad", async () => {
    const fcm = sender();
    await new PushNotifier(devices, fcm).push({ id: "n2", recipientId: "ana", type: "FRIEND_REQUEST", payload: { fromName: "Beto", fromUserId: "beto" } });
    expect(fcm.send).toHaveBeenCalledWith(
      ["tok-1", "tok-2"],
      expect.objectContaining({ title: "👋 Nueva solicitud de amistad", body: "Beto quiere ser tu amigo en WordHive" })
    );
  });

  it("avisa cuando aceptan tu solicitud", async () => {
    const fcm = sender();
    await new PushNotifier(devices, fcm).push({ id: "n9", recipientId: "ana", type: "FRIEND_ACCEPTED", payload: { friendName: "Beto", friendId: "beto" } });
    expect(fcm.send).toHaveBeenCalledWith(
      ["tok-1", "tok-2"],
      expect.objectContaining({ title: "🤝 ¡Tienes un nuevo amigo!", tag: "friend-accepted-beto" })
    );
  });

  it("no molesta con tipos informativos ni sin telefonos registrados", async () => {
    const fcm = sender();
    const notifier = new PushNotifier(devices, fcm);
    await notifier.push({ id: "n3", recipientId: "ana", type: "GAME_END", payload: {} });
    await notifier.push({ id: "n4", recipientId: "carla", type: "FRIEND_REQUEST", payload: {} });
    expect(fcm.send).not.toHaveBeenCalled();
  });

  it("olvida los tokens que FCM ya no reconoce", async () => {
    await new PushNotifier(devices, sender(["tok-2"])).push({ id: "n5", recipientId: "ana", type: "FRIEND_REQUEST", payload: {} });
    expect(devices.removeTokens).toHaveBeenCalledWith(["tok-2"]);
  });

  it("si FCM falla no rompe nada", async () => {
    const fcm = { enabled: true, send: vi.fn().mockRejectedValue(new Error("FCM caido")) };
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(new PushNotifier(devices, fcm).push({ id: "n6", recipientId: "ana", type: "FRIEND_REQUEST", payload: {} })).resolves.toBeUndefined();
  });

  it("sin credenciales de Firebase ni siquiera consulta los telefonos", async () => {
    await new PushNotifier(devices, { enabled: false, send: vi.fn() }).push({ id: "n7", recipientId: "ana", type: "FRIEND_REQUEST", payload: {} });
    expect(devices.listTokens).not.toHaveBeenCalled();
  });

  it("el despachador manda el push despues de guardar la notificacion", async () => {
    const world = createSocialWorld([]);
    const push = { push: vi.fn(async () => undefined) };
    const dispatcher = new NotificationDispatcher(world.notificationRepo as any, world.gateway, () => "n8", push as any);
    await dispatcher.notify({ recipientId: "ana", type: "FRIEND_REQUEST", payload: { fromName: "Beto" } });
    expect(push.push).toHaveBeenCalledWith(expect.objectContaining({ id: "n8", recipientId: "ana", type: "FRIEND_REQUEST" }));
  });

  it("registra y da de baja el telefono del usuario", async () => {
    const useCase = new ManagePushDeviceUseCase(devices);
    expect((await useCase.register("beto", "tok-9", "android")).isSuccess).toBe(true);
    expect(devices.upsert).toHaveBeenCalledWith("beto", "tok-9", "android");
    await useCase.unregister("beto", "tok-9");
    expect(devices.removeForUser).toHaveBeenCalledWith("beto", "tok-9");
  });
});
