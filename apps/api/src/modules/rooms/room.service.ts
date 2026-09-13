import { prisma } from '../../lib/prisma';

const POETIC_WORDS = [
  'roble', 'tinta', 'luna', 'cedro', 'sombra', 'verso', 'pluma', 'niebla',
  'aura', 'savia', 'canto', 'bruma', 'faro', 'zenit', 'prisma', 'eco',
  'duna', 'ambar', 'vela', 'viento', 'marfil', 'olivo', 'valle', 'bosque',
  'lienzo', 'alba', 'puerto', 'jardin', 'estudio', 'marea', 'cielo', 'fuego'
];

function generatePoeticRoomCode(): string {
  const pick = () => POETIC_WORDS[Math.floor(Math.random() * POETIC_WORDS.length)];
  const w1 = pick();
  let w2 = pick();
  while (w2 === w1) w2 = pick();
  let w3 = pick();
  while (w3 === w1 || w3 === w2) w3 = pick();
  return `${w1}-${w2}-${w3}`;
}

export class RoomService {
  static async create(hostId: string, puzzleId: string) {
    let code = generatePoeticRoomCode();
    // Ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      code = generatePoeticRoomCode();
    }

    const room = await prisma.room.create({
      data: {
        code,
        hostId,
        puzzleId,
      }
    });
    return room;
  }

  static async getByCode(code: string) {
    const trimmed = code.trim();
    return prisma.room.findFirst({
      where: {
        OR: [
          { code: trimmed },
          { code: { equals: trimmed, mode: 'insensitive' } },
          { id: trimmed }
        ]
      },
      include: {
        host: { select: { nickname: true } },
        puzzle: { select: { id: true, title: true, code: true, config: true, words: true, grid: true } }
      }
    });
  }

  static async setStatus(roomId: string, status: string) {
    return prisma.room.update({
      where: { id: roomId },
      data: { status }
    });
  }

  static async getRoomSummary(roomCodeOrId: string) {
    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { code: roomCodeOrId },
          { id: roomCodeOrId }
        ]
      },
      include: {
        puzzle: { select: { id: true, title: true, words: true } }
      }
    });

    if (!room) return null;

    const sessions = await prisma.gameSession.findMany({
      where: { roomId: room.id },
      include: {
        player: { select: { id: true, nickname: true } }
      }
    });

    const puzzleWords = (room.puzzle?.words as any[]) || [];
    const totalWords = puzzleWords.length;

    // Determine the completed session / winner
    const winnerSession = sessions.find(s => s.status === 'completed' || ((s.wordsFound as any[])?.length >= totalWords && totalWords > 0));

    const standings = sessions.map(s => {
      const wordsFound = (s.wordsFound as string[]) || [];
      const foundCount = wordsFound.length;
      const isWinner = winnerSession ? winnerSession.id === s.id : false;
      const mistakes = s.mistakes || 0;
      
      const accuracy = (foundCount + mistakes) > 0 
        ? Math.round((foundCount / (foundCount + mistakes)) * 100) 
        : (mistakes === 0 ? 100 : 0);

      const elapsed = s.elapsedMs 
        ? Number(s.elapsedMs) 
        : (s.completedAt ? Number(s.completedAt - s.startedAt) : (Date.now() - Number(s.startedAt)));

      return {
        id: s.playerId,
        sessionId: s.id,
        nickname: s.player?.nickname || 'Jugador',
        found: foundCount,
        total: s.wordsTotal || totalWords,
        mistakes,
        accuracy,
        elapsedMs: elapsed,
        isWinner,
        wordsFound,
        status: s.status,
        rank: 1
      };
    });

    // Sort standings:
    // 1. Winner first
    // 2. Most words found
    // 3. Lowest elapsed time
    // 4. Lowest mistakes
    standings.sort((a, b) => {
      if (a.isWinner && !b.isWinner) return -1;
      if (!a.isWinner && b.isWinner) return 1;
      if (b.found !== a.found) return b.found - a.found;
      if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
      return a.mistakes - b.mistakes;
    });

    standings.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    const winner = winnerSession ? {
      id: winnerSession.playerId,
      nickname: winnerSession.player?.nickname || 'Ganador',
      elapsedMs: winnerSession.elapsedMs ? Number(winnerSession.elapsedMs) : undefined
    } : (standings[0]?.isWinner ? {
      id: standings[0].id,
      nickname: standings[0].nickname,
      elapsedMs: standings[0].elapsedMs
    } : null);

    return {
      roomId: room.id,
      roomCode: room.code,
      status: room.status,
      puzzleTitle: room.puzzle?.title,
      totalWords,
      winner,
      standings
    };
  }
}
