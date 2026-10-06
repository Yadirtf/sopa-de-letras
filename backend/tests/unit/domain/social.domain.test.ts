import { describe, it, expect } from "vitest";
import { FriendPair } from "../../../src/domain/value-objects/friend-pair.vo";
import { FriendRequest } from "../../../src/domain/entities/friend-request.entity";
import { Notification } from "../../../src/domain/entities/notification.entity";
import {
  CannotFriendYourselfError,
  FriendRequestNotPendingError,
  SocialActionForbiddenError,
} from "../../../src/domain/errors/social.errors";

describe("FriendPair", () => {
  it("ordena los ids para que (A,B) y (B,A) sean la misma amistad", () => {
    const ab = FriendPair.of("zeta", "alfa");
    const ba = FriendPair.of("alfa", "zeta");
    expect(ab.key).toBe(ba.key);
    expect(ab.userAId).toBe("alfa");
    expect(ab.otherThan("alfa")).toBe("zeta");
    expect(ab.includes("zeta")).toBe(true);
  });

  it("no permite ser amigo de uno mismo", () => {
    expect(() => FriendPair.of("yo", "yo")).toThrow(CannotFriendYourselfError);
  });
});

describe("FriendRequest", () => {
  it("el destinatario puede aceptar una solicitud pendiente", () => {
    const req = FriendRequest.create("r1", "ana", "beto");
    req.accept("beto");
    expect(req.status).toBe("ACCEPTED");
    expect(req.isPending).toBe(false);
  });

  it("el remitente no puede aceptar su propia solicitud", () => {
    const req = FriendRequest.create("r1", "ana", "beto");
    expect(() => req.accept("ana")).toThrow(SocialActionForbiddenError);
  });

  it("no se puede responder dos veces", () => {
    const req = FriendRequest.create("r1", "ana", "beto");
    req.reject("beto");
    expect(() => req.accept("beto")).toThrow(FriendRequestNotPendingError);
  });

  it("solo el remitente puede cancelar", () => {
    const req = FriendRequest.create("r1", "ana", "beto");
    expect(() => req.assertCancellableBy("beto")).toThrow(SocialActionForbiddenError);
    expect(() => req.assertCancellableBy("ana")).not.toThrow();
  });

  it("reopen devuelve una solicitud vieja a PENDING", () => {
    const req = FriendRequest.create("r1", "ana", "beto");
    req.reject("beto");
    req.reopen();
    expect(req.isPending).toBe(true);
  });
});

describe("Notification", () => {
  it("nace sin leer y se puede marcar como leida", () => {
    const n = Notification.create({ id: "n1", recipientId: "ana", senderId: null, type: "GAME_END", payload: {} });
    expect(n.isRead).toBe(false);
    expect(n.belongsTo("ana")).toBe(true);
    n.markAsRead();
    expect(n.isRead).toBe(true);
  });
});
