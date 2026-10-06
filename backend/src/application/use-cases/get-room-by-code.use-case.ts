import { RedisRoomCache } from "../../infrastructure/cache/redis-room.cache";
import { IRoomRepository } from "../../domain/repositories/room.repository.interface";
import { RoomResponseDto } from "../dtos/room.dto";

export class GetRoomByCodeUseCase {
  constructor(
    private readonly roomCache: RedisRoomCache,
    private readonly roomRepo: IRoomRepository
  ) {}

  async execute(code: string): Promise<RoomResponseDto> {
    const upperCode = code.toUpperCase();
    const cached = await this.roomCache.getRoom(upperCode);

    if (cached) {
      return {
        id: cached.id,
        code: cached.code,
        wordSearchId: cached.wordSearchId,
        wordSearchTitle: cached.wordSearchTitle,
        hostUserId: cached.hostUserId,
        status: cached.status,
        maxPlayers: cached.maxPlayers,
        timeLimitSeconds: cached.timeLimitSeconds,
        isPrivate: cached.isPrivate,
        players: cached.players,
        shareUrl: `https://wordhive.app/room/${cached.code}`,
        deepLink: `wordhive://room/${cached.code}`,
        qrData: `https://wordhive.app/room/${cached.code}`,
      };
    }

    const dbRoom = await this.roomRepo.findByCode(upperCode);
    if (!dbRoom) {
      throw new Error('Sala no encontrada');
    }

    return {
      id: dbRoom.id,
      code: dbRoom.code,
      wordSearchId: dbRoom.wordSearchId,
      wordSearchTitle: 'Sopa de Letras',
      hostUserId: dbRoom.hostUserId,
      status: dbRoom.status,
      maxPlayers: dbRoom.maxPlayers,
      timeLimitSeconds: dbRoom.timeLimitSeconds,
      isPrivate: dbRoom.isPrivate,
      players: dbRoom.players,
      shareUrl: `https://wordhive.app/room/${dbRoom.code}`,
      deepLink: `wordhive://room/${dbRoom.code}`,
      qrData: `https://wordhive.app/room/${dbRoom.code}`,
    };
  }
}
