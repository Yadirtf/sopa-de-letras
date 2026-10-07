import { randomBytes } from "crypto";
import { IRoomRepository } from "../../domain/repositories/room.repository.interface";
import { IWordSearchRepository } from "../../domain/repositories/word-search.repository.interface";
import { RedisRoomCache, CachedRoomState } from "../../infrastructure/cache/redis-room.cache";
import { RoomEntity } from "../../domain/entities/room.entity";
import { CreateRoomDto, RoomResponseDto } from "../dtos/room.dto";
import { roomLinks } from "../common/room-links";

export class CreateRoomUseCase {
  constructor(
    private readonly roomRepo: IRoomRepository,
    private readonly wordSearchRepo: IWordSearchRepository,
    private readonly roomCache: RedisRoomCache
  ) {}

  async execute(
    hostUser: { id: string; name: string; avatarUrl?: string | null },
    dto: CreateRoomDto
  ): Promise<RoomResponseDto> {
    const wordSearch = await this.wordSearchRepo.findById(dto.wordSearchId);
    if (!wordSearch) {
      throw new Error('La sopa de letras especificada no existe');
    }

    const code = this.generateRoomCode();
    const roomId = randomBytes(16).toString('hex');
    const maxPlayers = Math.min(Math.max(dto.maxPlayers || 4, 2), 20);
    const timeLimitSeconds = dto.timeLimitSeconds && dto.timeLimitSeconds > 0
      ? Math.min(Math.max(dto.timeLimitSeconds, 30), 1800)
      : null;
    const isPrivate = dto.isPrivate ?? false;

    const hostColor = '#7C3AED';
    const roomEntity = RoomEntity.create({
      id: roomId,
      code,
      wordSearchId: wordSearch.id,
      hostUserId: hostUser.id,
      status: 'WAITING',
      maxPlayers,
      timeLimitSeconds,
      isPrivate,
      players: [{
        userId: hostUser.id,
        username: hostUser.name,
        avatarUrl: hostUser.avatarUrl,
        isHost: true,
        isReady: true,
        score: 0,
        wordsFound: [],
        colorHex: hostColor,
      }],
      createdAt: new Date(),
    });

    await this.roomRepo.create(roomEntity);

    // Extract solutions if available (soporta tanto strings como objetos PlacedWord)
    const solutionsMap: Record<string, any> = {};
    const rawWords = Array.isArray(wordSearch.words) ? wordSearch.words : [];
    const normalizedWords: string[] = [];

    for (const item of rawWords) {
      const wordStr = typeof item === 'string'
        ? item.trim().toUpperCase()
        : (item && typeof (item as any).word === 'string'
            ? (item as any).word.trim().toUpperCase()
            : '');
      if (!wordStr) continue;
      normalizedWords.push(wordStr);
      solutionsMap[wordStr] = typeof item === 'object' && item !== null
        ? { ...(item as Record<string, any>), word: wordStr }
        : { word: wordStr };
    }

    const cachedState: CachedRoomState = {
      id: roomId,
      code,
      wordSearchId: wordSearch.id,
      wordSearchTitle: wordSearch.title,
      hostUserId: hostUser.id,
      status: 'WAITING',
      maxPlayers,
      timeLimitSeconds,
      isPrivate,
      grid: wordSearch.grid || [],
      words: normalizedWords,
      solutions: solutionsMap,
      players: roomEntity.players,
      claimedWords: {},
      rematchVotes: [],
    };

    await this.roomCache.saveRoom(cachedState);


    return {
      id: roomId,
      code,
      wordSearchId: wordSearch.id,
      wordSearchTitle: wordSearch.title,
      hostUserId: hostUser.id,
      status: 'WAITING',
      maxPlayers,
      timeLimitSeconds,
      isPrivate,
      players: roomEntity.players,
      ...roomLinks(code),
    };
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
