import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { PuzzleService } from '../puzzles/puzzle.service';
import { GameService } from '../game/game.service';
import { prisma } from '../../lib/prisma';

interface PlayerInfo {
  socketId: string;
  userId: string;
  nickname: string;
}

const roomPlayers = new Map<string, Set<PlayerInfo>>();

export function setupRoomSocketHandlers(io: Server, socket: Socket) {
  socket.on('join_room', async (data: { roomCode?: string, code?: string, userId?: string, nickname?: string }) => {
    try {
      const rawCode = data.roomCode || data.code;
      if (!rawCode) return;
      const normalizedCode = rawCode.trim().toLowerCase();

      const room = await RoomService.getByCode(normalizedCode);
      if (!room) {
        socket.emit('room_error', { message: 'Sala no encontrada' });
        return;
      }

      const canonicalCode = room.code.toLowerCase();
      socket.join(canonicalCode);
      socket.join(room.code);
      
      let players = roomPlayers.get(canonicalCode);
      if (!players) {
        players = new Set<PlayerInfo>();
        roomPlayers.set(canonicalCode, players);
      }
      
      let userId = data.userId || socket.id;
      const nickname = data.nickname || 'Jugador';

      // Ensure user exists in database to prevent FK constraint failures
      if (data.userId) {
        const existing = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!existing) {
          try {
            const guest = await prisma.user.create({
              data: { id: data.userId, nickname, isGuest: true }
            });
            userId = guest.id;
          } catch {
            const guest = await prisma.user.create({
              data: { nickname, isGuest: true }
            });
            userId = guest.id;
          }
        }
      } else {
        const guest = await prisma.user.create({
          data: { nickname, isGuest: true }
        });
        userId = guest.id;
      }

      const playerInfo = { socketId: socket.id, userId, nickname };
      
      // Remove previous connections of same user if any
      for (const p of Array.from(players)) {
        if (p.userId === userId || p.socketId === socket.id || p.nickname === nickname) players.delete(p);
      }
      players.add(playerInfo);
      
      const formattedPlayers = Array.from(players).map(p => ({
        id: p.userId,
        nickname: p.nickname,
        found: 0,
        total: (room.puzzle?.words as any[])?.length || 0
      }));

      io.to(canonicalCode).emit('player_joined', formattedPlayers);
      io.to(room.code).emit('player_joined', formattedPlayers);

      // If game is already playing, sync this player immediately
      if (room.status === 'playing') {
        const rawPuzzle = (await PuzzleService.getByCode(room.puzzle.code)) || room.puzzle;
        const puzzle = {
          id: rawPuzzle.id,
          title: rawPuzzle.title,
          code: rawPuzzle.code,
          config: rawPuzzle.config,
          words: typeof rawPuzzle.words === 'string' ? JSON.parse(rawPuzzle.words) : rawPuzzle.words,
          grid: typeof rawPuzzle.grid === 'string' ? JSON.parse(rawPuzzle.grid) : rawPuzzle.grid,
        };

        let session = await prisma.gameSession.findFirst({
          where: { roomId: room.id, playerId: userId }
        });
        if (!session) {
          session = await GameService.createSession(room.puzzleId, userId, room.id);
        }

        let wordsFound: string[] = [];
        if (session && session.wordsFound) {
          wordsFound = typeof session.wordsFound === 'string' ? JSON.parse(session.wordsFound) : session.wordsFound;
        }

        socket.emit('game_started', {
          puzzle,
          sessions: { 
            [userId]: session.id,
            [socket.id]: session.id,
            ...(nickname ? { [nickname]: session.id } : {})
          },
          wordsFound
        });

        // Sync all room participants' progress to the reconnected socket
        try {
          const allSessions = await prisma.gameSession.findMany({
            where: { roomId: room.id },
            include: { player: true }
          });
          for (const s of allSessions) {
            const count = Array.isArray(s.wordsFound) ? s.wordsFound.length : 0;
            socket.emit('opponent_progress', {
              id: s.playerId,
              nickname: s.player?.nickname || 'Jugador',
              found: count,
              total: s.wordsTotal
            });
          }
        } catch (syncErr) {
          console.error('Error syncing opponent progress upon rejoin:', syncErr);
        }
      }
    } catch (err: any) {
      console.error('Error in join_room socket handler:', err);
      socket.emit('room_error', { message: err.message });
    }
  });
  
  socket.on('leave_room', (data: { roomCode?: string, code?: string, userId?: string }) => {
    const rawCode = data.roomCode || data.code;
    if (!rawCode) return;
    const canonicalCode = rawCode.trim().toLowerCase();
    
    socket.leave(canonicalCode);
    const players = roomPlayers.get(canonicalCode);
    if (players) {
      for (const p of Array.from(players)) {
        if (p.userId === data.userId || p.socketId === socket.id) {
          players.delete(p);
        }
      }
      const formattedPlayers = Array.from(players).map(p => ({
        id: p.userId,
        nickname: p.nickname,
        found: 0,
        total: 0
      }));
      io.to(canonicalCode).emit('player_left', formattedPlayers);
    }
  });
  
  socket.on('start_game', async (data: { roomCode?: string, code?: string, hostId?: string }) => {
    try {
      const rawCode = data.roomCode || data.code;
      if (!rawCode) return;
      const normalizedCode = rawCode.trim().toLowerCase();

      const room = await RoomService.getByCode(normalizedCode);
      if (!room) {
        socket.emit('room_error', { message: 'Sala no encontrada' });
        return;
      }
      const canonicalCode = room.code.toLowerCase();
      
      // Control check: only the host can start the match
      if (room.hostId && data.hostId && room.hostId !== data.hostId) {
        socket.emit('room_error', { message: 'Solo el anfitrión tiene control para iniciar la partida.' });
        return;
      }

      await RoomService.setStatus(room.id, 'playing');
      const rawPuzzle = (await PuzzleService.getByCode(room.puzzle.code)) || room.puzzle;
      const puzzle = {
        id: rawPuzzle.id,
        title: rawPuzzle.title,
        code: rawPuzzle.code,
        config: rawPuzzle.config,
        words: typeof rawPuzzle.words === 'string' ? JSON.parse(rawPuzzle.words) : rawPuzzle.words,
        grid: typeof rawPuzzle.grid === 'string' ? JSON.parse(rawPuzzle.grid) : rawPuzzle.grid,
      };
      
      const players = roomPlayers.get(canonicalCode) || new Set();
      
      // Create or find session for each player
      const sessions: Record<string, string> = {};
      for (const p of Array.from(players)) {
        let actualUserId = p.userId;
        const userExists = await prisma.user.findUnique({ where: { id: p.userId } });
        if (!userExists) {
          const guest = await prisma.user.create({
            data: { nickname: p.nickname || 'Jugador', isGuest: true }
          });
          actualUserId = guest.id;
        }

        let session = await prisma.gameSession.findFirst({
          where: { roomId: room.id, playerId: actualUserId }
        });
        if (!session) {
          session = await GameService.createSession(room.puzzleId, actualUserId, room.id);
        }

        sessions[p.userId] = session.id;
        sessions[actualUserId] = session.id;
        sessions[p.socketId] = session.id;
        if (p.nickname) {
          sessions[p.nickname] = session.id;
        }
      }

      // Ensure host has a session mapped
      if (room.hostId && !sessions[room.hostId]) {
        let hostSession = await prisma.gameSession.findFirst({
          where: { roomId: room.id, playerId: room.hostId }
        });
        if (!hostSession) {
          hostSession = await GameService.createSession(room.puzzleId, room.hostId, room.id);
        }
        sessions[room.hostId] = hostSession.id;
      }
      
      console.log(`[Multiplayer] Game started in room ${room.code} with ${Object.keys(sessions).length} player mappings`);
      io.to(canonicalCode).emit('game_started', { puzzle, sessions });
      io.to(room.code).emit('game_started', { puzzle, sessions });
    } catch (err: any) {
      console.error('Error starting game in socket:', err);
      socket.emit('room_error', { message: err.message });
    }
  });
  
  socket.on('disconnect', () => {
    for (const [roomCode, players] of roomPlayers.entries()) {
      let changed = false;
      for (const p of Array.from(players)) {
        if (p.socketId === socket.id) {
          players.delete(p);
          changed = true;
        }
      }
      if (changed) {
        io.to(roomCode).emit('player_left', Array.from(players));
      }
    }
  });
}
