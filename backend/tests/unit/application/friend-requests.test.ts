import { describe, it, expect, beforeEach } from "vitest";
import { SendFriendRequestUseCase } from "../../../src/application/use-cases/send-friend-request.use-case";
import { RespondFriendRequestUseCase } from "../../../src/application/use-cases/respond-friend-request.use-case";
import { RemoveFriendUseCase } from "../../../src/application/use-cases/remove-friend.use-case";
import { NotificationDispatcher } from "../../../src/application/services/notification-dispatcher.service";
import { FriendshipAnnouncer } from "../../../src/application/services/friendship-announcer.service";
import { createSocialWorld, profile, befriend } from "./social.fakes";

describe("Solicitudes de amistad (US-22)", () => {
  let world: ReturnType<typeof createSocialWorld>;
  let send: SendFriendRequestUseCase;
  let respond: RespondFriendRequestUseCase;
  let remove: RemoveFriendUseCase;
  let ids = 0;

  beforeEach(() => {
    world = createSocialWorld([profile("ana", "Ana"), profile("beto", "Beto"), profile("guest", "Invitado", true)]);
    const dispatcher = new NotificationDispatcher(world.notificationRepo as any, world.gateway, () => `n${++ids}`);
    const announcer = new FriendshipAnnouncer(dispatcher, world.gateway);
    send = new SendFriendRequestUseCase(world.friendshipRepo as any, world.requestRepo as any, dispatcher, announcer, () => `r${++ids}`);
    respond = new RespondFriendRequestUseCase(world.friendshipRepo as any, world.requestRepo as any, announcer, world.gateway);
    remove = new RemoveFriendUseCase(world.friendshipRepo as any, world.requestRepo as any, world.gateway);
  });

  it("crea una solicitud PENDING y notifica en tiempo real al destinatario", async () => {
    const result = await send.execute("ana", "beto");

    expect(result.isSuccess && result.value.status).toBe("PENDING");
    expect(world.notifications).toHaveLength(1);
    expect(world.notifications[0].type).toBe("FRIEND_REQUEST");
    expect(world.notifications[0].payload.fromName).toBe("Ana");
    expect(world.gateway.emitToUser).toHaveBeenCalledWith("beto", "notification:new", expect.objectContaining({ unreadCount: 1 }));
  });

  it("si la otra persona ya habia enviado solicitud, la amistad es instantanea", async () => {
    await send.execute("beto", "ana");
    const result = await send.execute("ana", "beto");

    expect(result.isSuccess && result.value.status).toBe("ACCEPTED");
    expect(world.friendships.size).toBe(1);
    const accepted = world.notifications.find((n) => n.type === "FRIEND_ACCEPTED");
    expect(accepted?.recipientId).toBe("beto");
    expect(world.gateway.emitToUsers).toHaveBeenCalledWith(["beto", "ana"], "friendship:updated", expect.anything());
  });

  it("no permite duplicar una solicitud pendiente", async () => {
    await send.execute("ana", "beto");
    const result = await send.execute("ana", "beto");
    expect(result.isFailure && result.error.code).toBe("FRIEND_REQUEST_ALREADY_SENT");
  });

  it("rechaza a invitados y a uno mismo con mensajes amables", async () => {
    const asGuest = await send.execute("guest", "ana");
    const toSelf = await send.execute("ana", "ana");
    const toGuest = await send.execute("ana", "guest");

    expect(asGuest.isFailure && asGuest.error.code).toBe("GUEST_SOCIAL_RESTRICTED");
    expect(toSelf.isFailure && toSelf.error.code).toBe("CANNOT_FRIEND_YOURSELF");
    expect(toGuest.isFailure && toGuest.error.code).toBe("USER_NOT_FOUND");
  });

  it("no envia solicitud si ya son amigos", async () => {
    befriend(world, "ana", "beto");
    const result = await send.execute("ana", "beto");
    expect(result.isFailure && result.error.code).toBe("ALREADY_FRIENDS");
  });

  it("aceptar crea la amistad y avisa a quien la envio", async () => {
    const sent = await send.execute("ana", "beto");
    const requestId = sent.isSuccess ? sent.value.requestId : "";

    const result = await respond.execute("beto", requestId, "ACCEPT");

    expect(result.isSuccess).toBe(true);
    expect(world.friendships.size).toBe(1);
    expect(world.notifications.some((n) => n.type === "FRIEND_ACCEPTED" && n.recipientId === "ana")).toBe(true);
  });

  it("rechazar borra la solicitud sin notificar al remitente", async () => {
    const sent = await send.execute("ana", "beto");
    const requestId = sent.isSuccess ? sent.value.requestId : "";
    const before = world.notifications.length;

    const result = await respond.execute("beto", requestId, "REJECT");

    expect(result.isSuccess).toBe(true);
    expect(world.requests.size).toBe(0);
    expect(world.notifications.length).toBe(before);
  });

  it("cancelar solo lo puede hacer el remitente", async () => {
    const sent = await send.execute("ana", "beto");
    const requestId = sent.isSuccess ? sent.value.requestId : "";

    const byRecipient = await respond.execute("beto", requestId, "CANCEL");
    const bySender = await respond.execute("ana", requestId, "CANCEL");

    expect(byRecipient.isFailure && byRecipient.error.code).toBe("SOCIAL_ACTION_FORBIDDEN");
    expect(bySender.isSuccess).toBe(true);
    expect(world.gateway.emitToUser).toHaveBeenCalledWith("beto", "friendship:updated", { reason: "CANCELLED" });
  });

  it("responde 404 si la solicitud no existe", async () => {
    const result = await respond.execute("beto", "nope", "ACCEPT");
    expect(result.isFailure && result.error.statusCode).toBe(404);
  });

  it("eliminar amigo borra la relacion y avisa al otro", async () => {
    befriend(world, "ana", "beto");
    const result = await remove.execute("ana", "beto");
    const again = await remove.execute("ana", "beto");

    expect(result.isSuccess).toBe(true);
    expect(world.friendships.size).toBe(0);
    expect(world.requestRepo.deleteAllBetween).toHaveBeenCalledWith("ana", "beto");
    expect(again.isFailure && again.error.code).toBe("NOT_FRIENDS");
  });
});
