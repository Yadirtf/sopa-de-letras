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
  getRoom(code: string): Promise<LiveRoomSnapshot | null>;
}
