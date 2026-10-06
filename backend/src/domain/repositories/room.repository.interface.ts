import { RoomEntity, RoomStatus } from "../entities/room.entity";

export interface SavePlayerResultInput {
  userId: string;
  score: number;
  rank: number;
  wordsFound: string[];
}

export interface IRoomRepository {
  create(room: RoomEntity): Promise<RoomEntity>;
  findById(id: string): Promise<RoomEntity | null>;
  findByCode(code: string): Promise<RoomEntity | null>;
  updateStatus(id: string, status: RoomStatus, startedAt?: Date, endedAt?: Date): Promise<void>;
  addParticipant(roomId: string, userId: string): Promise<void>;
  saveMatchResults(roomId: string, results: SavePlayerResultInput[]): Promise<void>;
}
