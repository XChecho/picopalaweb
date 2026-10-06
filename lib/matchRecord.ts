import type { Difficulty, ILocalMove, MatchResult } from "@/types/game";
import { MAX_ATTEMPTS } from "@/store/useMatchStore";

type TApiResult = "WIN" | "LOSS" | "DRAW";
type TApiDifficulty = "EASY" | "MEDIUM" | "HARD";

/** Body of one entry of `POST /stats/sync`. */
export interface IMatchRecord {
  clientMatchId: string;
  aiDifficulty: TApiDifficulty;
  result: TApiResult;
  attemptsUsed: number;
  maxTurns: number;
  totalPicos: number;
  totalPalas: number;
  durationSec: number;
  finishedAt: string;
}

const RESULT_MAP: Record<MatchResult, TApiResult> = { win: "WIN", lose: "LOSS", draw: "DRAW" };
const DIFFICULTY_MAP: Record<Difficulty, TApiDifficulty> = {
  novice: "EASY",
  tactician: "MEDIUM",
  grandmaster: "HARD",
};

const MAX_DURATION_SEC = 86_400;

interface IMatchSnapshot {
  matchId: string;
  difficulty: Difficulty;
  moves: ILocalMove[];
  startedAt: number | null;
  finishedAt: number | null;
}

/**
 * Maps the in-memory match to the backend payload. Returns null when there is nothing worth
 * recording (no id, or a match forfeited before the player made a single guess).
 */
export function buildMatchRecord(
  snapshot: IMatchSnapshot,
  result: MatchResult,
  options: { forfeit?: boolean } = {},
): IMatchRecord | null {
  const playerMoves = snapshot.moves.filter((move) => move.isPlayerMove);
  if (!snapshot.matchId || (options.forfeit && playerMoves.length === 0)) return null;

  const finishedAt = snapshot.finishedAt ?? Date.now();
  const startedAt = snapshot.startedAt ?? finishedAt;
  const durationSec = Math.min(MAX_DURATION_SEC, Math.max(0, Math.round((finishedAt - startedAt) / 1000)));

  return {
    clientMatchId: snapshot.matchId,
    aiDifficulty: DIFFICULTY_MAP[snapshot.difficulty],
    result: RESULT_MAP[result],
    // The backend requires at least one attempt; a loss where the bot guessed first still counts as 1.
    attemptsUsed: Math.min(MAX_ATTEMPTS, Math.max(1, playerMoves.length)),
    maxTurns: MAX_ATTEMPTS,
    totalPicos: playerMoves.reduce((sum, move) => sum + move.feedback.picos, 0),
    totalPalas: playerMoves.reduce((sum, move) => sum + move.feedback.palas, 0),
    durationSec,
    finishedAt: new Date(finishedAt).toISOString(),
  };
}
