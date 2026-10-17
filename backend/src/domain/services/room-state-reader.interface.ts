/** Juego al que pertenece la sala: cada uno tiene sus propios codigos. */
export type InviteGame = "word_search" | "battle";

/**
 * Vista minima de una sala en vivo que el modulo social necesita para invitar.
 * La implementa RedisRoomCache sin que el dominio dependa de Redis.
 */
export interface LiveRoomSnapshot {
  code: string;
  wordSearchTitle: string;
  hostUserId: string;
  status: "WAITING" | "COUNTDOWN" | "IN_PROGRESS" | "FINISHED";
  maxPlayers: number;
  players: Array<{ userId: string }>;
}

export interface IRoomStateReader {
  getRoom(code: string, game?: InviteGame): Promise<LiveRoomSnapshot | null>;
}
