import { create } from "zustand";
import type { Actor, Difficulty, ILocalMove, MatchPhase, MatchResult } from "@/types/game";
import {
  calculateFeedback,
  generateAIMove,
  generateEasyAIMove,
  generateSecretNumber,
  isGuessRepeated,
  validateGuess,
} from "@/lib/gameLogic";

export const MAX_ATTEMPTS = 12;
export const TIMER_SECONDS = 60;
const AI_MIN_DELAY_MS = 2000;
const AI_START_DELAY_MS = 500;

export type TSubmitError =
  | "NOT_YOUR_TURN"
  | "INVALID_LENGTH"
  | "INVALID_DIGITS"
  | "REPEATED_DIGITS"
  | "DUPLICATE_GUESS";

export type TSubmitResult = { ok: true } | { ok: false; error: TSubmitError };

interface IMatchState {
  phase: MatchPhase;
  difficulty: Difficulty;
  playerSecret: string;
  opponentSecret: string;
  moves: ILocalMove[];
  starter: Actor | null;
  currentActor: Actor | null;
  playerAttemptsLeft: number;
  aiAttemptsLeft: number;
  result: MatchResult | null;
  isAIThinking: boolean;
  timeRemaining: number;
  timeUp: boolean;

  openSetup: (difficulty: Difficulty) => void;
  lockSecret: (secret: string) => boolean;
  beginPlay: () => void;
  submitGuess: (guess: string) => TSubmitResult;
  tick: () => void;
  clearTimeUp: () => void;
  reset: () => void;
}

const initialState = {
  phase: "idle" as MatchPhase,
  difficulty: "grandmaster" as Difficulty,
  playerSecret: "",
  opponentSecret: "",
  moves: [] as ILocalMove[],
  starter: null as Actor | null,
  currentActor: null as Actor | null,
  playerAttemptsLeft: MAX_ATTEMPTS,
  aiAttemptsLeft: MAX_ATTEMPTS,
  result: null as MatchResult | null,
  isAIThinking: false,
  timeRemaining: TIMER_SECONDS,
  timeUp: false,
};

let timers: ReturnType<typeof setTimeout>[] = [];

function clearTimers(): void {
  timers.forEach((handle) => clearTimeout(handle));
  timers = [];
}

function nextActor(current: Actor, playerLeft: number, aiLeft: number): Actor {
  const other: Actor = current === "PLAYER" ? "AI" : "PLAYER";
  const otherLeft = other === "PLAYER" ? playerLeft : aiLeft;
  return otherLeft > 0 ? other : current;
}

export const useMatchStore = create<IMatchState>((set, get) => {
  const finish = (result: MatchResult, patch: Partial<IMatchState> = {}) => {
    clearTimers();
    set({ ...patch, phase: "finished", result, isAIThinking: false });
  };

  const runAITurn = () => {
    const state = get();
    if (state.phase !== "playing" || state.currentActor !== "AI") return;

    set({ isAIThinking: true });

    const aiMoves = state.moves.filter((move) => !move.isPlayerMove);
    const guess = generateAIMove(state.difficulty, aiMoves);

    timers.push(
      setTimeout(() => {
        const current = get();
        if (current.phase !== "playing") return;

        const feedback = calculateFeedback(guess, current.playerSecret);
        const move: ILocalMove = {
          turnNumber: current.moves.length + 1,
          guess,
          feedback,
          isPlayerMove: false,
        };
        const moves = [...current.moves, move];
        const aiAttemptsLeft = current.aiAttemptsLeft - 1;

        if (feedback.isWin) {
          finish("lose", { moves, aiAttemptsLeft });
          return;
        }

        if (aiAttemptsLeft <= 0 && current.playerAttemptsLeft <= 0) {
          finish("draw", { moves, aiAttemptsLeft });
          return;
        }

        set({
          moves,
          aiAttemptsLeft,
          isAIThinking: false,
          currentActor: nextActor("AI", current.playerAttemptsLeft, aiAttemptsLeft),
          timeRemaining: TIMER_SECONDS,
        });

        if (get().currentActor === "AI") runAITurn();
      }, AI_MIN_DELAY_MS),
    );
  };

  return {
    ...initialState,

    openSetup: (difficulty) => {
      clearTimers();
      set({ ...initialState, difficulty, phase: "setup" });
    },

    lockSecret: (secret) => {
      if (!validateGuess(secret).valid || get().phase !== "setup") return false;

      set({
        playerSecret: secret,
        opponentSecret: generateSecretNumber(),
        starter: Math.random() < 0.5 ? "PLAYER" : "AI",
        phase: "toss",
      });
      return true;
    },

    beginPlay: () => {
      const { phase, starter } = get();
      if (phase !== "toss" || !starter) return;

      set({ phase: "playing", currentActor: starter, timeRemaining: TIMER_SECONDS });

      if (starter === "AI") {
        timers.push(setTimeout(runAITurn, AI_START_DELAY_MS));
      }
    },

    submitGuess: (guess) => {
      const state = get();
      if (state.phase !== "playing" || state.currentActor !== "PLAYER" || state.isAIThinking) {
        return { ok: false, error: "NOT_YOUR_TURN" };
      }

      const validation = validateGuess(guess);
      if (!validation.valid) {
        return { ok: false, error: validation.errorCode ?? "INVALID_LENGTH" };
      }

      if (isGuessRepeated(guess, state.moves.filter((move) => move.isPlayerMove))) {
        return { ok: false, error: "DUPLICATE_GUESS" };
      }

      const feedback = calculateFeedback(guess, state.opponentSecret);
      const move: ILocalMove = {
        turnNumber: state.moves.length + 1,
        guess,
        feedback,
        isPlayerMove: true,
      };
      const moves = [...state.moves, move];
      const playerAttemptsLeft = state.playerAttemptsLeft - 1;

      if (feedback.isWin) {
        finish("win", { moves, playerAttemptsLeft });
        return { ok: true };
      }

      if (playerAttemptsLeft <= 0 && state.aiAttemptsLeft <= 0) {
        finish("draw", { moves, playerAttemptsLeft });
        return { ok: true };
      }

      set({
        moves,
        playerAttemptsLeft,
        currentActor: nextActor("PLAYER", playerAttemptsLeft, state.aiAttemptsLeft),
      });

      if (get().currentActor === "AI") {
        timers.push(setTimeout(runAITurn, AI_START_DELAY_MS));
      } else {
        set({ timeRemaining: TIMER_SECONDS });
      }

      return { ok: true };
    },

    // Only the hardest level runs a clock on the player's turn (same as the mobile app).
    tick: () => {
      const state = get();
      if (
        state.phase !== "playing" ||
        state.currentActor !== "PLAYER" ||
        state.difficulty !== "grandmaster"
      ) {
        return;
      }

      const next = state.timeRemaining - 1;
      if (next > 0) {
        set({ timeRemaining: next });
        return;
      }

      const used = state.moves.filter((move) => move.isPlayerMove).map((move) => move.guess);
      get().submitGuess(generateEasyAIMove(used));
      set({ timeUp: true });
    },

    clearTimeUp: () => set({ timeUp: false }),

    reset: () => {
      clearTimers();
      set({ ...initialState });
    },
  };
});
