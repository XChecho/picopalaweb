export type AppView = 'landing' | 'play-hub' | 'arena' | 'records' | 'how-to-play' | 'auth';

export type GameMode = 'ai' | 'private' | 'global';
export type Difficulty = 'novice' | 'tactician' | 'grandmaster';

export interface TurnRecord {
  id: string;
  turnNumber: number;
  actor: 'YOU' | 'BOT' | 'RIVAL';
  actorName: string;
  guess: number[];
  picos: number; // exact position & digit match
  palas: number; // digit exists in secret, but wrong position
  misses: number; // digit does not exist
  timestamp: string;
}

export interface MatchHistoryItem {
  id: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  mode: 'global' | 'ai' | 'private';
  modeLabel: string;
  opponent: {
    name: string;
    initials: string;
    subtext: string;
    elo?: number;
  };
  stakes: string;
  turnsTaken: number;
  maxTurns: number;
  picosInTurn: number;
  palasInTurn: number;
  timestamp: string;
}

export interface DuelistProfile {
  handle: string;
  email: string;
  rankTitle: string;
  elo: number;
  seasonTag: string;
  statusText: string;
  gamesPlayed: number;
  gamesWeekDelta: number;
  victories: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  draws: number;
  avgDecryptTurns: number;
  totalPicos: number;
  totalPalas: number;
  avgTurnPace: number;
}

export interface AudioSettings {
  soundEffects: boolean;
  matchAmbientMusic: boolean;
  hapticFeedback: boolean;
  turnAlerts: boolean;
}

export type Actor = 'PLAYER' | 'AI';
export type MatchPhase = 'idle' | 'setup' | 'toss' | 'playing' | 'finished';
export type MatchResult = 'win' | 'lose' | 'draw';

export interface IMoveFeedback {
  picos: number;
  palas: number;
  isWin: boolean;
}

export interface ILocalMove {
  turnNumber: number;
  guess: string;
  feedback: IMoveFeedback;
  isPlayerMove: boolean;
}

export interface IGuessValidation {
  valid: boolean;
  errorCode?: 'INVALID_LENGTH' | 'INVALID_DIGITS' | 'REPEATED_DIGITS';
}
