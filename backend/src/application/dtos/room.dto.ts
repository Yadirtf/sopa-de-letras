export interface CreateRoomDto {
  wordSearchId: string;
  maxPlayers?: number;
  timeLimitSeconds?: number;
  isPrivate?: boolean;
}

export interface RoomPlayerDto {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isHost: boolean;
  isReady: boolean;
  score: number;
  wordsFound: string[];
  colorHex: string;
  rank?: number;
}

export interface RoomResponseDto {
  id: string;
  code: string;
  wordSearchId: string;
  wordSearchTitle: string;
  hostUserId: string;
  status: string;
  maxPlayers: number;
  timeLimitSeconds: number;
  isPrivate: boolean;
  players: RoomPlayerDto[];
  shareUrl: string;
  deepLink: string;
  qrData: string;
}

export interface SubmitWordPayload {
  roomCode: string;
  userId: string;
  word: string;
  coordinates: {
    start: [number, number];
    end: [number, number];
  };
}

export interface WordFoundResultDto {
  word: string;
  claimedBy: {
    userId: string;
    username: string;
    colorHex: string;
  };
  coordinates: {
    start: [number, number];
    end: [number, number];
  };
  pointsAwarded: number;
  newScore: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  colorHex: string;
  score: number;
  wordsCount: number;
  progressPercent: number;
}

export interface PodiumItemDto {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  score: number;
  wordsCount: number;
  trophiesEarned: number;
}
