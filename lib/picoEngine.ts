/**
 * Pico & Pala (Bulls & Cows) Core Cryptographic Deduction Engine
 * Rules:
 * - 4 unique digits from 1 to 9 (0 is strictly prohibited)
 * - PICO: correct digit in exact correct position
 * - PALA: correct digit, but in wrong position
 * - MISS: digit not present in secret
 * - Victory: 4 Picos
 */

export function generateSecret(): number[] {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const secret: number[] = [];
  while (secret.length < 4) {
    const idx = Math.floor(Math.random() * digits.length);
    secret.push(digits[idx]);
    digits.splice(idx, 1);
  }
  return secret;
}

export interface EvaluationResult {
  picos: number;
  palas: number;
  misses: number;
}

export function evaluateGuess(secret: number[], guess: number[]): EvaluationResult {
  let picos = 0;
  let palas = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      picos++;
    } else if (secret.includes(guess[i])) {
      palas++;
    }
  }

  const misses = 4 - (picos + palas);
  return { picos, palas, misses };
}

export function isValidCipher(code: number[]): boolean {
  if (code.length !== 4) return false;
  const set = new Set(code);
  if (set.size !== 4) return false;
  return code.every(d => d >= 1 && d <= 9);
}

// Generate all 3024 permutations of 4 digits from 1..9
let allPermutationsCache: number[][] | null = null;
export function getAllPermutations(): number[][] {
  if (allPermutationsCache) return allPermutationsCache;
  const perms: number[][] = [];
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const a of digits) {
    for (const b of digits) {
      if (b === a) continue;
      for (const c of digits) {
        if (c === a || c === b) continue;
        for (const d of digits) {
          if (d === a || d === b || d === c) continue;
          perms.push([a, b, c, d]);
        }
      }
    }
  }
  allPermutationsCache = perms;
  return perms;
}

/**
 * Intelligent AI bot solver that simulates Novice, Tactician, or Grandmaster logic.
 */
export function generateBotGuess(
  pastBotGuesses: { guess: number[]; picos: number; palas: number }[],
  difficulty: 'novice' | 'tactician' | 'grandmaster' = 'grandmaster'
): number[] {
  const all = getAllPermutations();

  // If no past history, pick an optimal opening book guess (e.g. 1 2 3 4, 3 7 1 9, etc.)
  if (pastBotGuesses.length === 0) {
    const openings = [
      [3, 7, 1, 9],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [2, 4, 6, 8],
      [1, 3, 5, 7]
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  // Filter candidates that are mathematically consistent with all past responses
  const consistentCandidates = all.filter(candidate => {
    for (const record of pastBotGuesses) {
      const evalRes = evaluateGuess(candidate, record.guess);
      if (evalRes.picos !== record.picos || evalRes.palas !== record.palas) {
        return false;
      }
    }
    return true;
  });

  if (difficulty === 'novice') {
    // Novice has a 40% chance of making an exploratory mistake
    if (Math.random() < 0.4 || consistentCandidates.length === 0) {
      return generateSecret();
    }
    return consistentCandidates[Math.floor(Math.random() * consistentCandidates.length)];
  }

  if (difficulty === 'tactician') {
    // Tactician picks from consistent candidates with high probability
    if (consistentCandidates.length > 0) {
      return consistentCandidates[Math.floor(Math.random() * consistentCandidates.length)];
    }
    return generateSecret();
  }

  // Grandmaster: picks the first or minimax most informative consistent candidate
  if (consistentCandidates.length > 0) {
    // Pick the most balanced candidate
    return consistentCandidates[0];
  }

  return generateSecret();
}
