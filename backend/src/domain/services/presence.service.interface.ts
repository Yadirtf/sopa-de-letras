/**
 * Presencia de jugadores (US-23).
 * - ONLINE: tiene la app abierta (socket social con heartbeat vivo).
 * - PLAYING: ademas esta dentro de una sala.
 * - OFFLINE: sin heartbeat en los ultimos 60 s.
 */
export type PresenceStatus = "ONLINE" | "PLAYING" | "OFFLINE";

export interface PresenceSnapshot {
  status: PresenceStatus;
  roomCode: string | null;
}

export interface IPresenceStore {
  markOnline(userId: string): Promise<void>;
  /** Renueva el TTL; devuelve false si la presencia ya habia expirado. */
  heartbeat(userId: string): Promise<boolean>;
  markPlaying(userId: string, roomCode: string): Promise<boolean>;
  markBackOnline(userId: string): Promise<boolean>;
  markOffline(userId: string): Promise<void>;
  getMany(userIds: string[]): Promise<Map<string, PresenceSnapshot>>;
}
