import { describe, it, expect, afterEach } from "vitest";
import { configureRoomLinks, roomLinks } from "../../../src/application/common/room-links";
import { webLinkFor } from "../../../src/infrastructure/push/fcm-push.sender";

const PLAY = "https://wordhive.example/jugar";

describe("Enlaces de la version web", () => {
  afterEach(() => configureRoomLinks("https://wordhive-landing.onrender.com/jugar"));

  it("el enlace y el QR de una sala abren la web en esa sala", () => {
    configureRoomLinks(`${PLAY}/`);
    expect(roomLinks("abc123")).toEqual({
      shareUrl: `${PLAY}/room/ABC123`,
      deepLink: "wordhive://room/ABC123",
      qrData: `${PLAY}/room/ABC123`,
    });
  });

  it("el clic en un aviso del navegador lleva a la pagina de ese aviso", () => {
    expect(webLinkFor(PLAY, { type: "ROOM_INVITE", roomCode: "hive92" })).toBe(`${PLAY}/room/HIVE92`);
    expect(webLinkFor(PLAY, { type: "FRIEND_REQUEST" })).toBe(`${PLAY}/friends`);
    expect(webLinkFor(PLAY, { type: "FRIEND_ACCEPTED" })).toBe(`${PLAY}/friends`);
    expect(webLinkFor(`${PLAY}/`, { type: "ACHIEVEMENT" })).toBe(`${PLAY}/notifications`);
  });
});
