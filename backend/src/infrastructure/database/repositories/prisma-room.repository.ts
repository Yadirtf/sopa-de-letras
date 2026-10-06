import { PrismaClient, RoomStatus as PrismaRoomStatus } from "@prisma/client";
import { RoomEntity, RoomStatus } from "../../../domain/entities/room.entity";
import {
  IRoomRepository,
  SavePlayerResultInput,
} from "../../../domain/repositories/room.repository.interface";

export class PrismaRoomRepository implements IRoomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(room: RoomEntity): Promise<RoomEntity> {
    const raw = await this.prisma.room.create({
      data: {
        id: room.id,
        code: room.code,
        wordSearchId: room.wordSearchId,
        hostUserId: room.hostUserId,
        status: (room.status === 'COUNTDOWN' ? 'WAITING' : room.status) as PrismaRoomStatus,
        createdAt: room.createdAt,
      },
    });

    // Also link host as first RoomPlayer
    await this.prisma.roomPlayer.upsert({
      where: { roomId_userId: { roomId: raw.id, userId: room.hostUserId } },
      create: {
        roomId: raw.id,
        userId: room.hostUserId,
        wordsFound: [],
        score: 0,
      },
      update: {},
    });

    return room;
  }

  async findById(id: string): Promise<RoomEntity | null> {
    const raw = await this.prisma.room.findUnique({
      where: { id },
      include: {
        players: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByCode(code: string): Promise<RoomEntity | null> {
    const raw = await this.prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async updateStatus(
    id: string,
    status: RoomStatus,
    startedAt?: Date,
    endedAt?: Date
  ): Promise<void> {
    const prismaStatus = (status === 'COUNTDOWN' ? 'WAITING' : status) as PrismaRoomStatus;
    await this.prisma.room.update({
      where: { id },
      data: {
        status: prismaStatus,
        ...(startedAt && { startedAt }),
        ...(endedAt && { endedAt }),
      },
    });
  }

  async addParticipant(roomId: string, userId: string): Promise<void> {
    await this.prisma.roomPlayer.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, wordsFound: [], score: 0 },
      update: {},
    });
  }

  async saveMatchResults(roomId: string, results: SavePlayerResultInput[]): Promise<void> {
    await this.prisma.$transaction(
      results.map((r) =>
        this.prisma.roomPlayer.upsert({
          where: { roomId_userId: { roomId, userId: r.userId } },
          create: {
            roomId,
            userId: r.userId,
            score: r.score,
            rank: r.rank,
            wordsFound: r.wordsFound,
            finishedAt: new Date(),
          },
          update: {
            score: r.score,
            rank: r.rank,
            wordsFound: r.wordsFound,
            finishedAt: new Date(),
          },
        })
      )
    );
  }

  private mapToEntity(raw: any): RoomEntity {
    return RoomEntity.create({
      id: raw.id,
      code: raw.code,
      wordSearchId: raw.wordSearchId,
      hostUserId: raw.hostUserId,
      status: raw.status as RoomStatus,
      maxPlayers: 8,
      timeLimitSeconds: 180,
      isPrivate: false,
      players: (raw.players || []).map((p: any) => ({
        userId: p.userId,
        username: p.user?.name || 'Jugador',
        avatarUrl: p.user?.avatarUrl,
        isHost: p.userId === raw.hostUserId,
        isReady: false,
        score: p.score || 0,
        wordsFound: Array.isArray(p.wordsFound) ? p.wordsFound : [],
        colorHex: '#7C3AED',
        rank: p.rank,
      })),
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      createdAt: raw.createdAt,
    });
  }
}
