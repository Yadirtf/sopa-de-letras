/**
 * Enlaces publicos de una sala. La version web del juego vive en `/jugar`
 * de la landing: el enlace abre el navegador y entra directo al lobby, y el
 * mismo enlace va dentro del QR.
 */
let playUrl = "https://wordhive-landing.onrender.com/jugar";

/** Se llama una vez en el arranque con PLAY_URL. */
export function configureRoomLinks(url: string): void {
  playUrl = url.replace(/\/+$/, "");
}

export function roomLinks(code: string): { shareUrl: string; deepLink: string; qrData: string } {
  const upper = code.toUpperCase();
  const shareUrl = `${playUrl}/room/${upper}`;
  return { shareUrl, deepLink: `wordhive://room/${upper}`, qrData: shareUrl };
}
