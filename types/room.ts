import type { TApiGameMode, TMatchResult, TMatchStatus } from "@/types/player";

export type TRoomStatus = "WAITING" | "IN_GAME" | "CLOSED" | "EXPIRED";

/** `POST /room/private` */
export interface IRoomCreated {
  id: string;
  code: string;
  hostId: string;
  maxTurns: number;
  status: TRoomStatus;
  expiresAt: string;
}

/** `GET /room/private/:code` */
export interface IRoomState {
  id: string;
  code: string;
  hostId: string;
  guestId: string | null;
  status: TRoomStatus;
  maxTurns: number;
  expiresAt: string;
  matchId: string | null;
  matchStatus: TMatchStatus | null;
}

/** `POST /room/private/join` */
export interface IRoomJoined {
  room: { id: string; code: string; hostId: string; guestId: string; status: TRoomStatus; matchId: string };
  match: { id: string };
}

export interface IMoveView {
  id: string;
  seat: number | null;
  playerId: string | null;
  turnNumber: number;
  guess: string;
  picos: number;
  palas: number;
  isWin: boolean;
  createdAt: string;
}

export interface IMatchParticipantView {
  seat: number;
  playerId: string | null;
  isAi: boolean;
  result: TMatchResult | null;
  attemptsUsed: number;
}

/** `GET /match/:id` and the entries of `GET /match/active`. The rival's secret is only included once the match is over. */
export interface IMatchView {
  id: string;
  mode: TApiGameMode;
  status: TMatchStatus;
  endReason: string | null;
  maxTurns: number;
  currentSeat: number | null;
  /** Setup deadline while WAITING, turn deadline while PLAYING. */
  turnDeadlineAt: string | null;
  mySeat: number | null;
  player1Id: string | null;
  player2Id: string | null;
  player1Number?: string | null;
  player2Number?: string | null;
  winnerId: string | null;
  turnCount: number;
  participants: IMatchParticipantView[];
  moves: IMoveView[];
  /** A pending rematch offer for this (finished) match, if any. */
  rematch?: IRematchOffer | null;
}

export interface IRematchOffer {
  code: string;
  requestedBy: string;
}

/** `GET /match/active` answers `{}` when the player has no unfinished match. */
export type TActiveMatch = Partial<IMatchView>;
