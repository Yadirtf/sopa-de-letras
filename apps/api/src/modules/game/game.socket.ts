import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomService } from '../rooms/room.service';
import { prisma } from '../../lib/prisma';
import { CellSelection } from '@sopadeletras/engine';

export function setupGameSocketHandlers(io: Server, socket: Socket) {
  socket.on('join_game', (sessionId: string) => {
    socket.join(`game_${sessionId}`);
  });
  
  socket.on('word_found', async (data: { sessionId: string, roomId?: string, roomCode?: string, code?: string, cells: CellSelection[], userId?: string, nickname?: string }) => {
    try {
      const roomKey = data.roomId || data.roomCode || data.code;
      let targetSessionId = data.sessionId;

      // Verify if targetSessionId exists in GameSession table
      let session = await prisma.gameSession.findUnique({
        where: { id: targetSessionId },
        include: { puzzle: true, player: true }
      });

      // Resilient fallback: find session by room and user if targetSessionId was not valid
      if (!session && roomKey) {
        const room = await RoomService.getByCode(roomKey);
        if (room) {
          const uId = data.userId || (socket as any).userId;
          if (uId) {
            session = await prisma.gameSession.findFirst({
              where: { roomId: room.id, playerId: uId },
              include: { puzzle: true, player: true }
            });
          }
          if (!session && data.nickname) {
            session = await prisma.gameSession.findFirst({
              where: { roomId: room.id, player: { nickname: data.nickname } },
              include: { puzzle: true, player: true }
            });
          }
          if (session) {
            targetSessionId = session.id;
          }
        }
      }

      if (!session) {
        socket.emit('game_error', { message: 'Sesión no encontrada' });
        return;
      }

      const result = await GameService.processMove(targetSessionId, data.cells);
      
      if (result.valid) {
        socket.emit('word_confirmed', { word: result.word });
        
        if (roomKey) {
          const updatedSession = await GameService.getSession(targetSessionId);
          if (updatedSession) {
            const foundCount = (updatedSession.wordsFound as any[]).length;
            // Broadcast progress to ALL players in the room including sender
            io.to(roomKey).emit('opponent_progress', {
              id: updatedSession.playerId,
              nickname: updatedSession.player.nickname,
              found: foundCount,
              total: updatedSession.wordsTotal
            });
          }
        }
        
        if (result.isComplete) {
          const finalSession = await GameService.getSession(targetSessionId);
          if (roomKey) {
            const room = await RoomService.getByCode(roomKey);
            if (room) {
              await RoomService.setStatus(room.id, 'finished');
              const now = BigInt(Date.now());
              
              // Finalize all other sessions in this room that were still playing
              const otherSessions = await prisma.gameSession.findMany({
                where: { roomId: room.id, status: 'playing' }
              });
              for (const os of otherSessions) {
                await prisma.gameSession.update({
                  where: { id: os.id },
                  data: {
                    status: 'finished',
                    completedAt: now,
                    elapsedMs: now - os.startedAt
                  }
                });
              }
            }

            const summary = await RoomService.getRoomSummary(roomKey);

            io.to(roomKey).emit('game_finished', {
              winnerId: finalSession?.playerId,
              nickname: finalSession?.player.nickname,
              elapsedMs: finalSession?.elapsedMs?.toString(),
              standings: summary?.standings || [],
              summary,
              roomCode: roomKey
            });
          } else {
            socket.emit('game_finished', {
              winnerId: finalSession?.playerId,
              nickname: finalSession?.player.nickname,
              elapsedMs: finalSession?.elapsedMs?.toString(),
              mistakes: finalSession?.mistakes || 0,
              found: (finalSession?.wordsFound as any[])?.length || 0,
              total: finalSession?.wordsTotal || 0
            });
          }
        }
      } else {
        socket.emit('word_rejected', { message: result.message });
      }
    } catch (err: any) {
      socket.emit('game_error', { message: err.message });
    }
  });
}
