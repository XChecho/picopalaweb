import type { Difficulty, IGuessValidation, ILocalMove, IMoveFeedback } from "@/types/game";

// Ported from picopalaapp/core/utils/gameLogic.ts (same rules and AI strategies).
const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function generateSecretNumber(): string {
  const digits = [...ALL_DIGITS];
  const selected: number[] = [];

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    selected.push(digits[randomIndex]);
    digits.splice(randomIndex, 1);
  }

  return selected.join("");
}

export function validateGuess(guess: string): IGuessValidation {
  if (guess.length !== 4) {
    return { valid: false, errorCode: "INVALID_LENGTH" };
  }

  if (!/^[1-9]+$/.test(guess)) {
    return { valid: false, errorCode: "INVALID_DIGITS" };
  }

  if (new Set(guess.split("")).size !== 4) {
    return { valid: false, errorCode: "REPEATED_DIGITS" };
  }

  return { valid: true };
}

export function calculateFeedback(guess: string, secret: string): IMoveFeedback {
  let picos = 0;
  let palas = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      picos++;
    } else if (secret.includes(guess[i])) {
      palas++;
    }
  }

  return { picos, palas, isWin: picos === 4 };
}

export function isGuessRepeated(guess: string, moves: ILocalMove[]): boolean {
  return moves.some((move) => move.guess === guess);
}

export function generateEasyAIMove(usedGuesses: string[]): string {
  const usedSet = new Set(usedGuesses);
  let guess: string;
  let attempts = 0;

  do {
    guess = generateSecretNumber();
    attempts++;
  } while (usedSet.has(guess) && attempts < 100);

  return guess;
}

export function generateMediumAIMove(history: ILocalMove[]): string {
  const filtered = filterByHistory(getAllPossibilities(), history);

  if (filtered.length === 0) {
    return generateSecretNumber();
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function generateHardAIMove(history: ILocalMove[]): string {
  const filtered = filterByHistory(getAllPossibilities(), history);

  if (filtered.length === 0) {
    return generateSecretNumber();
  }

  if (filtered.length === 1) {
    return filtered[0];
  }

  // Minimax: pick the guess whose worst-case feedback bucket leaves the fewest candidates.
  // Counting buckets per guess keeps this O(candidates * filtered) instead of quadratic.
  let bestGuess = filtered[0];
  let minMaxRemaining = Infinity;

  const candidates = filtered.length > 50 ? filtered.slice(0, 50) : filtered;

  for (const guess of candidates) {
    const buckets = new Map<number, number>();
    let maxRemaining = 0;

    for (const secret of filtered) {
      const { picos, palas } = calculateFeedback(guess, secret);
      const key = picos * 10 + palas;
      const count = (buckets.get(key) ?? 0) + 1;
      buckets.set(key, count);
      if (count > maxRemaining) maxRemaining = count;
    }

    if (maxRemaining < minMaxRemaining) {
      minMaxRemaining = maxRemaining;
      bestGuess = guess;
    }
  }

  return bestGuess;
}

// Web difficulty levels map to the app's EASY / MEDIUM / HARD.
export function generateAIMove(difficulty: Difficulty, aiMoves: ILocalMove[]): string {
  if (difficulty === "novice") {
    return generateEasyAIMove(aiMoves.map((move) => move.guess));
  }
  if (difficulty === "tactician") {
    return generateMediumAIMove(aiMoves);
  }
  return generateHardAIMove(aiMoves);
}

export function countRemainingCandidates(playerMoves: ILocalMove[]): number {
  return filterByHistory(getAllPossibilities(), playerMoves).length;
}

let possibilitiesCache: string[] | null = null;

function getAllPossibilities(): string[] {
  if (possibilitiesCache) return possibilitiesCache;

  const possibilities: string[] = [];

  for (const a of ALL_DIGITS) {
    for (const b of ALL_DIGITS) {
      if (b === a) continue;
      for (const c of ALL_DIGITS) {
        if (c === a || c === b) continue;
        for (const d of ALL_DIGITS) {
          if (d === a || d === b || d === c) continue;
          possibilities.push(`${a}${b}${c}${d}`);
        }
      }
    }
  }

  possibilitiesCache = possibilities;
  return possibilities;
}

function filterByHistory(possibilities: string[], moves: ILocalMove[]): string[] {
  return possibilities.filter((secret) =>
    moves.every((move) => {
      const feedback = calculateFeedback(move.guess, secret);
      return feedback.picos === move.feedback.picos && feedback.palas === move.feedback.palas;
    }),
  );
}
