import { RedisRoomCache, CachedRoomState } from "../../infrastructure/cache/redis-room.cache";
import { WordSearchGeneratorService } from "../../domain/services/word-search-generator.service";

export interface RematchVoteResult {
  votesCount: number;
  totalPlayers: number;
  requiredVotes: number;
  hasQuorum: boolean;
  votedUserIds: string[];
}

export class RoomRematchService {
  constructor(
    private readonly roomCache: RedisRoomCache,
    private readonly generatorService: WordSearchGeneratorService
  ) {}

  async vote(code: string, userId: string): Promise<RematchVoteResult> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new Error('SALA_NO_ENCONTRADA');

    if (!state.rematchVotes.includes(userId)) {
      state.rematchVotes.push(userId);
      await this.roomCache.saveRoom(state);
    }

    const totalPlayers = state.players.length;
    const votesCount = state.rematchVotes.length;
    const requiredVotes = Math.max(1, Math.ceil(totalPlayers / 2));
    const hasQuorum = votesCount >= requiredVotes;

    return {
      votesCount,
      totalPlayers,
      requiredVotes,
      hasQuorum,
      votedUserIds: state.rematchVotes,
    };
  }

  async resetForRematch(code: string): Promise<CachedRoomState> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new Error('SALA_NO_ENCONTRADA');

    // Regenerate fresh grid with the words
    const generated = this.generatorService.generate({
      words: state.words,
      gridSize: state.grid.length,
      difficulty: 'MEDIUM',
    });

    const newSolutions: Record<string, any> = {};
    for (const w of generated.placedWords) {
      newSolutions[w.word.toUpperCase()] = {
        start: [w.startRow, w.startCol],
        end: [w.endRow, w.endCol],
        word: w.word.toUpperCase(),
      };
    }

    state.grid = generated.grid;
    state.solutions = newSolutions;
    state.status = 'WAITING';
    state.claimedWords = {};
    state.rematchVotes = [];
    state.startedAt = null;
    state.endsAt = null;
    state.countdownStartTime = null;

    // Reset player scores and readiness
    for (const p of state.players) {
      p.score = 0;
      p.wordsFound = [];
      p.wordCoords = {};
      p.isReady = p.isHost;
    }

    await this.roomCache.saveRoom(state);
    return state;
  }
}
