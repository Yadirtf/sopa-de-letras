import { RedisRoomCache, CachedRoomState } from "../../infrastructure/cache/redis-room.cache";
import { WordValidationHelper } from "./word-validation.helper";
import { LeaderboardEntryDto, WordFoundResultDto } from "../dtos/room.dto";

const PLAYER_COLORS = [
  '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E',
  '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6', '#EAB308',
  '#D946EF', '#6366F1', '#0EA5E9', '#84CC16', '#F97316',
  '#A855F7', '#22C55E', '#0284C7', '#FB7185', '#2DD4BF',
];
export class RoomManagerService {
  constructor(private readonly roomCache: RedisRoomCache) {}

  async getRoom(code: string): Promise<CachedRoomState | null> {
    return this.roomCache.getRoom(code);
  }

  async addPlayer(
    code: string,
    player: { userId: string; username: string; avatarUrl?: string | null }
  ): Promise<{ state: CachedRoomState; joinedPlayer: any }> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new Error('SALA_NO_ENCONTRADA');

    // Reconectar (app en segundo plano, red movil) devuelve al jugador a su sitio.
    const returning = state.players.find((p) => p.userId === player.userId);
    if (returning) {
      returning.isConnected = true;
      // La sala se crea por HTTP sin nombre ni avatar (el token no los lleva): se completan aqui.
      if (player.username?.trim()) returning.username = player.username.trim();
      if (player.avatarUrl) returning.avatarUrl = player.avatarUrl;
      await this.roomCache.saveRoom(state);
      return { state, joinedPlayer: returning };
    }

    if (state.status !== 'WAITING') throw new Error('PARTIDA_EN_CURSO');
    if (state.players.length >= state.maxPlayers) throw new Error('SALA_LLENA');

    const isHost = state.hostUserId === player.userId;
    const joinedPlayer = {
      userId: player.userId,
      username: player.username,
      avatarUrl: player.avatarUrl,
      isHost,
      isReady: isHost, // El anfitrion siempre esta listo
      score: 0,
      wordsFound: [],
      colorHex: this.pickFreeColor(state),
    };
    state.players.push(joinedPlayer);
    await this.roomCache.saveRoom(state);
    return { state, joinedPlayer };
  }

  private pickFreeColor(state: CachedRoomState): string {
    const used = new Set(state.players.map((p) => p.colorHex));
    return PLAYER_COLORS.find((c) => !used.has(c)) ?? PLAYER_COLORS[state.players.length % PLAYER_COLORS.length];
  }

  async removePlayer(code: string, userId: string): Promise<{ state: CachedRoomState; newHostId?: string }> {
    const state = await this.roomCache.getRoom(code);
    if (!state) throw new Error('SALA_NO_ENCONTRADA');

    state.players = state.players.filter((p) => p.userId !== userId);
    let newHostId: string | undefined;

    if (state.hostUserId === userId && state.players.length > 0) {
      state.hostUserId = state.players[0].userId;
      state.players[0].isHost = true;
      state.players[0].isReady = true;
      newHostId = state.hostUserId;
    }

    await this.roomCache.saveRoom(state);
    return { state, newHostId };
  }

  async submitWord(
    code: string,
    userId: string,
    word: string,
    coords: { start: [number, number]; end: [number, number] }
  ): Promise<{ wordFound: WordFoundResultDto; allCompleted: boolean; updatedState: CachedRoomState }> {
    const state = await this.roomCache.getRoom(code);
    if (!state || state.status !== 'IN_PROGRESS') throw new Error('PARTIDA_NO_ACTIVA');

    const cleanWord = word.trim().toUpperCase();
    const isTargetWord = state.words.includes(cleanWord);
    if (!isTargetWord) throw new Error('PALABRA_INVALIDA');

    const isValidGeometry = WordValidationHelper.isValidStraightLine(coords.start, coords.end, cleanWord.length);
    if (!isValidGeometry) throw new Error('TRAZO_GEOMETRICO_INVALIDO');

    const extracted = WordValidationHelper.extractWordFromGrid(state.grid, coords.start, coords.end);
    if (extracted !== cleanWord && extracted !== cleanWord.split('').reverse().join('')) {
      throw new Error('COORDENADAS_NO_COINCIDEN');
    }

    const player = state.players.find((p) => p.userId === userId);
    if (!player) throw new Error('JUGADOR_NO_ENCONTRADO');

    if (player.wordsFound.includes(cleanWord)) throw new Error('PALABRA_YA_ENCONTRADA');

    const isFirstClaim = !state.claimedWords[cleanWord];
    const scoreAwarded = WordValidationHelper.calculateWordScore(cleanWord.length, isFirstClaim);

    player.wordsFound.push(cleanWord);
    player.wordCoords = { ...player.wordCoords, [cleanWord]: coords };
    player.score += scoreAwarded;

    if (isFirstClaim) {
      state.claimedWords[cleanWord] = {
        userId: player.userId,
        username: player.username,
        colorHex: player.colorHex,
        timestamp: Date.now(),
      };
    }

    await this.roomCache.saveRoom(state);

    // Cada quien tiene su propia sopa: gana la carrera el primero en completarla.
    const allCompleted = player.wordsFound.length >= state.words.length;

    const wordFound: WordFoundResultDto = {
      word: cleanWord,
      claimedBy: { userId: player.userId, username: player.username, colorHex: player.colorHex },
      coordinates: coords,
      pointsAwarded: scoreAwarded,
      newScore: player.score,
    };

    return { wordFound, allCompleted, updatedState: state };
  }

  getLeaderboard(state: CachedRoomState): LeaderboardEntryDto[] {
    const totalWords = Math.max(state.words.length, 1);
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    return sorted.map((p, idx) => ({
      rank: idx + 1,
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      colorHex: p.colorHex,
      score: p.score,
      wordsCount: p.wordsFound.length,
      progressPercent: Math.min(100, Math.round((p.wordsFound.length / totalWords) * 100)),
    }));
  }
}
