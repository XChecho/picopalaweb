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
