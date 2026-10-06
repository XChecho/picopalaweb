export type TApiGameMode = "VERSUS_AI" | "PRIVATE" | "GLOBAL";
export type TMatchStatus = "WAITING" | "PLAYING" | "FINISHED" | "CANCELLED";
export type TApiDifficulty = "EASY" | "MEDIUM" | "HARD";
export type TMatchResult = "WIN" | "LOSS" | "DRAW";

export interface IPlayerStatsByMode {
  mode: TApiGameMode;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  bestAttempts: number | null;
  totalAttempts: number;
  totalPicos: number;
  totalPalas: number;
  totalDurationSec: number;
}

export interface IPlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  bestAttempts: number | null;
  totalAttempts: number;
  totalPicos: number;
  totalPalas: number;
  totalDurationSec: number;
  avgTimePerGame: number;
  byMode: IPlayerStatsByMode[];
}

export interface IMatchParticipant {
  seat: number;
  playerId: string | null;
  isAi: boolean;
  result: TMatchResult | null;
  attemptsUsed: number;
  eloBefore: number | null;
  eloAfter: number | null;
  player: { username: string; avatarUrl: string | null } | null;
}

export interface IMatchHistoryItem {
  id: string;
  mode: TApiGameMode;
  status: TMatchStatus;
  endReason: string | null;
  isRanked: boolean;
  maxTurns: number;
  /** Only set for VERSUS_AI matches (and only on backends that already expose it). */
  aiDifficulty?: TApiDifficulty | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  participants: IMatchParticipant[];
}

export interface IMatchHistoryResponse {
  matches: IMatchHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export type TMatchModeFilter = "all" | "ai" | "private" | "global";
