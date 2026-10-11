"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Eye, Flag, Loader2, Lock, RotateCcw, Send, Swords, Timer, Trophy, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BoardCell, type IBoardMove } from "@/components/arena/BoardCell";
import { ColumnHeader } from "@/components/arena/ColumnHeader";
import { MatchResultModal, type TMatchOutcome } from "@/components/arena/MatchResultModal";
import { SecretSetupModal } from "@/components/arena/SecretSetupModal";
import { TurnComposer } from "@/components/arena/TurnComposer";
import { WriteTurnModal } from "@/components/arena/WriteTurnModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useForfeitMatch,
  useMatchView,
  useRequestRematch,
  useSetSecret,
  useSubmitMove,
} from "@/hooks/useHumanMatch";
import { useCountdown } from "@/hooks/useCountdown";
import { useJoinRoom, useRoomState } from "@/hooks/useRoom";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError } from "@/lib/api";
import { soundEngine } from "@/lib/audio";
import { countRemainingCandidates, validateGuess } from "@/lib/gameLogic";
import { roomErrorKey } from "@/lib/roomErrors";
import { useAuthStore } from "@/store/useAuthStore";
import type { ILocalMove } from "@/types/game";
import type { IMatchView, IMoveView } from "@/types/room";

interface PrivateMatchProps {
  matchId: string;
  onExit: () => void;
  /** A rematch started: continue in the new match. */
  onSwitchMatch: (matchId: string) => void;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");
const formatClock = (seconds: number): string => `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;

const toBoardMove = (move: IMoveView): IBoardMove => ({ guess: move.guess, feedback: { picos: move.picos, palas: move.palas } });

const toDigits = (value: string | null | undefined): number[] => (value ? value.split("").map(Number) : []);

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="max-w-xl w-full mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">{children}</div>;
}

export const PrivateMatch: React.FC<PrivateMatchProps> = ({ matchId, onExit, onSwitchMatch }) => {
  const { t } = useTranslation("room");
  const { t: ta } = useTranslation("arena");
  const playerId = useAuthStore((state) => state.player?.id);
  const { data: view, error, isPending, failureCount } = useMatchView(matchId);

  if (isPending) {
    return (
      <Centered>
        <Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" />
        <p className="text-sm text-[#a98891]">{t("loading")}</p>
      </Centered>
    );
  }

  // Keep showing the last known state through transient failures; only a definitive 403/404 ends the view.
  const gone = error instanceof ApiError && (error.status === 404 || error.status === 403);
  if (!view || gone) {
    return (
      <Centered>
        <p role="alert" className="text-rose-400 font-bold">
          {t(gone || !error ? "errors.notFound" : roomErrorKey(error))}
        </p>
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider"
        >
          {ta("unavailable.back")}
        </button>
      </Centered>
    );
  }

  return (
    <MatchBoard
      view={view}
      matchId={matchId}
      playerId={playerId}
      connectionLost={failureCount > 0 || Boolean(error)}
      onExit={onExit}
      onSwitchMatch={onSwitchMatch}
    />
  );
};

interface MatchBoardProps {
  view: IMatchView;
  matchId: string;
  playerId: string | undefined;
  connectionLost: boolean;
  onExit: () => void;
  onSwitchMatch: (matchId: string) => void;
}

function MatchBoard({ view, matchId, playerId, connectionLost, onExit, onSwitchMatch }: MatchBoardProps) {
  const { t } = useTranslation("room");
  const { t: ta } = useTranslation("arena");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const submitMove = useSubmitMove(matchId);
  const setSecret = useSetSecret(matchId);
  const forfeit = useForfeitMatch(matchId);
  const requestRematch = useRequestRematch(matchId);
  const joinRoom = useJoinRoom();

  const [draft, setDraft] = useState<number[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const soundedRef = useRef(false);

  const secondsLeft = useCountdown(view.turnDeadlineAt);
  const mySeat = view.mySeat;
  const finished = view.status === "FINISHED" || view.status === "CANCELLED";
  const setupPhase = view.status === "WAITING";
  const playing = view.status === "PLAYING";
  const myTurn = playing && view.currentSeat === mySeat;
  const canPlay = myTurn && !submitMove.isPending;
  const mySecret = mySeat === 1 ? view.player1Number : view.player2Number;
  // The backend reveals the rival's secret to both players once the match is over.
  const rivalSecret = mySeat === 1 ? view.player2Number : view.player1Number;

  const myMoves = useMemo(() => view.moves.filter((move) => move.seat === mySeat), [view.moves, mySeat]);
  const rivalMoves = useMemo(() => view.moves.filter((move) => move.seat !== mySeat), [view.moves, mySeat]);
  const remainingCandidates = useMemo(
    () =>
      countRemainingCandidates(
        myMoves.map<ILocalMove>((move) => ({
          turnNumber: move.turnNumber,
          guess: move.guess,
          feedback: { picos: move.picos, palas: move.palas, isWin: move.isWin },
          isPlayerMove: true,
        })),
      ),
    [myMoves],
  );
  const totalPicos = myMoves.reduce((sum, move) => sum + move.picos, 0);
  const totalPalas = myMoves.reduce((sum, move) => sum + move.palas, 0);

  const turnCount = Math.min(view.maxTurns, Math.floor(view.moves.length / 2) + 1);
  const sending = submitMove.isPending;
  const rivalSlots = rivalMoves.length + (playing && !myTurn ? 1 : 0);
  const mySlots = myMoves.length + (playing && (myTurn || sending) ? 1 : 0);
  const rowCount = Math.max(rivalSlots, mySlots, 1);

  // Prefer the participant's own result (independent of the auth store); fall back to the winner id.
  const myResult = view.participants.find((p) => p.seat === mySeat)?.result;
  const outcome: TMatchOutcome | "cancelled" | null = !finished
    ? null
    : view.status === "CANCELLED"
      ? "cancelled"
      : myResult === "WIN"
        ? "win"
        : myResult === "LOSS"
          ? "lose"
          : myResult === "DRAW" || view.winnerId === null
            ? "draw"
            : view.winnerId === playerId
              ? "win"
              : "lose";

  const statusState = finished
    ? "finished"
    : !playing
      ? "preparing"
      : sending
        ? "sending"
        : myTurn
          ? "your-turn"
          : "opponent";
  const statusText = {
    finished: ta("status.finished"),
    preparing: ta("status.preparing"),
    sending: t("match.sending"),
    "your-turn": ta("status.yourTurn"),
    opponent: ta("status.opponentTurn"),
  }[statusState];

  // Sound once when the match ends.
  useEffect(() => {
    if (!outcome || soundedRef.current) return;
    soundedRef.current = true;
    if (outcome === "lose") soundEngine.playErrorBuzz();
    else if (outcome === "win") soundEngine.playVictoryFanfare();
  }, [outcome]);

  // The keypad can only be open on the player's turn.
  useEffect(() => {
    if (!canPlay) setWriteOpen(false);
  }, [canPlay]);

  useEffect(() => {
    const board = boardRef.current;
    if (board) board.scrollTop = board.scrollHeight;
  }, [rowCount]);

  // Rematch: the requester follows the new room until the rival joins it.
  const rematch = view.rematch ?? null;
  const rematchByMe = rematch !== null && rematch.requestedBy === playerId;
  const rematchRoom = useRoomState(rematch && rematchByMe ? rematch.code : null);
  const rematchMatchId = rematchRoom.data?.matchId ?? null;
  useEffect(() => {
    if (rematchMatchId) onSwitchMatch(rematchMatchId);
  }, [rematchMatchId, onSwitchMatch]);

  const pressKey = useCallback(
    (digit: number) => {
      if (!canPlay) return;
      setDraft((prev) => (prev.includes(digit) || prev.length >= 4 ? prev : [...prev, digit]));
      soundEngine.playKeypad();
      setErrorMsg(null);
    },
    [canPlay],
  );
  const backspace = useCallback(() => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setDraft((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  }, [canPlay]);
  const clear = useCallback(() => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setDraft([]);
    setErrorMsg(null);
  }, [canPlay]);

  const submit = useCallback(() => {
    if (!canPlay) return;
    const guess = draft.join("");
    const validation = validateGuess(guess);
    if (!validation.valid) {
      soundEngine.playErrorBuzz();
      setErrorMsg(ta(`errors.${validation.errorCode ?? "INVALID_LENGTH"}`));
      return;
    }
    soundEngine.playSubmit();
    submitMove.mutate(guess, {
      onSuccess: () => {
        setDraft([]);
        setErrorMsg(null);
        setWriteOpen(false);
      },
      onError: (err) => setErrorMsg(t(roomErrorKey(err))),
    });
  }, [canPlay, draft, submitMove, ta, t]);

  // Physical keyboard: digits open the keypad on mobile, Enter submits, Escape closes/clears.
  const latest = useRef({ pressKey, backspace, clear, submit, draftLength: draft.length, writeOpen, isDesktop });
  useLayoutEffect(() => {
    latest.current = { pressKey, backspace, clear, submit, draftLength: draft.length, writeOpen, isDesktop };
  });
  useEffect(() => {
    if (!canPlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.isComposing) return;
      const target = event.target instanceof Element ? event.target : null;
      // Text fields and confirmation dialogs own the keyboard; a focused keypad button does not.
      if (target?.closest("input, textarea, select, [role=alertdialog]")) return;
      if (document.querySelector("[role=alertdialog]")) return;
      const current = latest.current;
      const composerOpen = current.isDesktop || current.writeOpen;
      if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        if (!current.isDesktop) setWriteOpen(true);
        current.pressKey(Number(event.key));
      } else if (event.key === "Backspace") {
        if (!composerOpen) return;
        event.preventDefault();
        current.backspace();
      } else if (event.key === "Escape") {
        if (current.isDesktop) current.clear();
        else setWriteOpen(false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (composerOpen) current.submit();
        else setWriteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPlay]);

  const startRematch = () => {
    if (rematch && !rematchByMe) {
      // The rival asked first: accept by joining their room.
      joinRoom.mutate(rematch.code, { onSuccess: (joined) => onSwitchMatch(joined.room.matchId) });
    } else if (!rematch) {
      requestRematch.mutate();
    }
  };

  const rematchBusy = requestRematch.isPending || joinRoom.isPending;
  const rematchWaiting = rematchByMe;
  // A live offer (either side) takes precedence over a stale error from a clash of simultaneous requests.
  const rematchError = rematch ? null : (requestRematch.error ?? joinRoom.error);
  const rematchLabel = rematchWaiting
    ? t("result.rematchWaiting")
    : rematch
      ? t("result.rematchAccept")
      : t("result.rematch");

  const rivalName = t("match.rival");
  const rows = Array.from({ length: rowCount }, (_, i) => i);
  const timerCritical = myTurn && secondsLeft !== null && secondsLeft <= 10;
  const timerLabel = playing && secondsLeft !== null ? formatClock(secondsLeft) : "--:--";

  const resultTitleKey = outcome === "cancelled" ? "cancelled" : outcome === "lose" ? "loss" : outcome;

  return (
    <div className="w-full flex flex-col select-none h-[calc(100dvh-5rem)] overflow-hidden [@media(max-height:560px)]:h-auto [@media(max-height:560px)]:min-h-[calc(100dvh-5rem)] [@media(max-height:560px)]:overflow-visible">
      {/* TOP BAR */}
      <div className="shrink-0 border-b border-[#282a30] bg-[#0c0e14]/70 backdrop-blur">
        <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span
              data-testid="turn-indicator"
              className="shrink-0 px-2.5 py-1 rounded-lg bg-[#191b21] border border-[#282a30] font-['Cairo'] text-base font-black text-white tabular-nums"
            >
              {ta("turn", { n: pad2(turnCount), max: view.maxTurns })}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                title={ta("hud.clock")}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#191b21] border border-[#282a30]"
              >
                <Timer className="w-4 h-4 text-[#00d2ff]" />
                <span
                  data-testid="turn-timer"
                  className={`font-mono text-sm font-bold tabular-nums ${timerCritical ? "text-[#ff4d4d]" : "text-[#00d2ff]"}`}
                >
                  {timerLabel}
                </span>
              </div>
              {!finished && (
                <button
                  onClick={() => setConfirmForfeit(true)}
                  title={t("match.forfeit")}
                  aria-label={t("match.forfeit")}
                  data-testid="forfeit"
                  className="w-9 h-9 rounded-full bg-[#191b21] hover:bg-rose-950/40 border border-[#282a30] text-[#a98891] hover:text-rose-400 flex items-center justify-center transition-all"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-[#a98891]">
            <span
              data-testid="match-status"
              data-state={statusState === "your-turn" ? "your-turn" : statusState === "opponent" ? "rival-turn" : statusState}
              className={`min-w-0 flex-1 truncate flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border ${
                statusState === "your-turn"
                  ? "bg-[#ff479b]/15 border-[#ff479b]/50 text-[#ffb0ca] shadow-[0_0_12px_rgba(255,46,149,0.3)]"
                  : "bg-[#111319] border-[#282a30] text-[#00d2ff]"
              }`}
            >
              {statusState === "sending" ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
              ) : (
                <span
                  className={`w-2 h-2 shrink-0 rounded-full ${
                    statusState === "your-turn" ? "bg-[#ff479b] animate-pulse" : statusState === "opponent" ? "bg-[#00d2ff] animate-ping" : "bg-[#a98891]"
                  }`}
                />
              )}
              <span className="truncate">{statusText}</span>
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#111319] border border-[#282a30]">
              <span className="text-[#ffe170] font-bold tabular-nums">{ta("hud.candidates", { count: remainingCandidates })}</span>
            </span>
          </div>
          {connectionLost && (
            <p role="status" className="flex items-center justify-center gap-1.5 text-xs text-[#ffe170]">
              <Loader2 className="w-3 h-3 animate-spin" /> {t("match.connectionLost")}
            </p>
          )}
        </div>
      </div>

      {/* BOARD: rival on the left, you on the right */}
      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-2 sm:px-4 pt-2 flex flex-col gap-2">
        <div className="shrink-0 grid grid-cols-2 gap-2 sm:gap-4">
          <ColumnHeader
            side="opponent"
            title={ta("columns.opponent")}
            subtitle={rivalName}
            icon={<Swords className="w-4 h-4 text-[#00d2ff]" />}
            digits={finished && rivalSecret ? toDigits(rivalSecret) : null}
            secretLabel={ta("columns.secretHidden")}
            attemptsLabel={ta("columns.guessesLeft", { n: Math.max(0, view.maxTurns - rivalMoves.length) })}
          />
          <ColumnHeader
            side="you"
            title={ta("columns.you")}
            subtitle={ta("columns.yourSecret")}
            icon={<User className="w-4 h-4 text-[#ff479b]" />}
            digits={mySecret ? toDigits(mySecret) : null}
            secretLabel={ta("columns.yourSecret")}
            attemptsLabel={ta("columns.guessesLeft", { n: Math.max(0, view.maxTurns - myMoves.length) })}
          />
        </div>

        <div
          ref={boardRef}
          data-testid="board"
          className="flex-1 min-h-0 overflow-y-auto [@media(max-height:560px)]:overflow-visible pr-0.5 pb-2 grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 content-start"
        >
          {rows.map((i) => (
            <React.Fragment key={i}>
              <BoardCell
                actor="RIVAL"
                move={rivalMoves[i] ? toBoardMove(rivalMoves[i]) : undefined}
                round={i + 1}
                pending={!rivalMoves[i] && i === rivalMoves.length && playing && !myTurn && !sending ? t("match.rivalThinking") : null}
              />
              <BoardCell
                actor="YOU"
                move={myMoves[i] ? toBoardMove(myMoves[i]) : undefined}
                round={i + 1}
                syncing={sending}
                pending={
                  !myMoves[i] && i === myMoves.length && playing && (myTurn || sending)
                    ? sending
                      ? t("match.sending")
                      : ta("columns.pendingYou")
                    : null
                }
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="shrink-0 border-t border-[#282a30] bg-[#0c0e14]/90 backdrop-blur">
        <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-[#a98891]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.7)]" />
              {ta("hud.legendPico")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-[#ff479b]" />
              {ta("hud.legendPala")}
            </span>
          </div>
          {finished ? (
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <button
                onClick={() => setReviewing(false)}
                className="h-12 sm:flex-1 px-5 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" /> {ta("result.showResult")}
              </button>
              {outcome !== "cancelled" && (
                <button
                  onClick={startRematch}
                  disabled={rematchBusy || rematchWaiting}
                  className="h-12 sm:flex-1 px-5 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {rematchBusy || rematchWaiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {rematchLabel}
                </button>
              )}
              <button
                onClick={onExit}
                className="h-12 sm:flex-1 px-5 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t("result.exit")}
              </button>
            </div>
          ) : isDesktop ? (
            <TurnComposer
              draft={draft}
              canPlay={canPlay}
              busy={sending}
              errorMsg={errorMsg}
              turnLabel={ta("write.title", { n: pad2(turnCount) })}
              onPress={pressKey}
              onBackspace={backspace}
              onClear={clear}
              onSubmit={submit}
            />
          ) : (
            <>
              {errorMsg && !writeOpen && (
                <span role="alert" className="text-xs font-bold text-rose-400 text-center">
                  {errorMsg}
                </span>
              )}
              <button
                onClick={() => canPlay && setWriteOpen(true)}
                disabled={!canPlay}
                className={`w-full h-14 rounded-2xl font-['Cairo'] font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  canPlay
                    ? "bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-[0.99]"
                    : "bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed"
                }`}
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {canPlay ? ta("write.button") : ta("write.waiting")}
              </button>
            </>
          )}
        </div>
      </div>

      {!isDesktop && writeOpen && canPlay && (
        <WriteTurnModal
          turnLabel={ta("write.title", { n: pad2(turnCount) })}
          draft={draft}
          errorMsg={errorMsg}
          busy={sending}
          onPress={pressKey}
          onBackspace={backspace}
          onClear={clear}
          onSubmit={submit}
          onClose={() => setWriteOpen(false)}
        />
      )}

      {/* SECRET: pick it, or wait for the rival */}
      {setupPhase && !mySecret && (
        <SecretSetupModal
          description={t("secret.subtitle")}
          busy={setSecret.isPending}
          errorMsg={setSecret.isError ? t(roomErrorKey(setSecret.error)) : null}
          hint={secondsLeft !== null ? t("secret.timeLeft", { seconds: secondsLeft }) : null}
          onLock={(secret) => {
            soundEngine.playSubmit();
            setSecret.mutate({ secret });
          }}
          onCancel={() => setConfirmForfeit(true)}
        />
      )}
      {setupPhase && mySecret && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            data-testid="secret-locked"
            className="max-w-sm w-full bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.3)]">
              <Lock className="w-7 h-7 text-[#ffe170]" />
            </div>
            <p className="font-['Cairo'] text-2xl font-black text-white tracking-[0.3em] pl-[0.3em]">{mySecret}</p>
            <p className="flex items-center gap-2 text-sm text-[#e2bdc7]">
              <Loader2 className="w-4 h-4 animate-spin text-[#00d2ff]" /> {t("secret.waitingRival")}
            </p>
            {secondsLeft !== null && <p className="text-xs text-[#a98891]">{t("secret.timeLeft", { seconds: secondsLeft })}</p>}
            <button
              onClick={() => setConfirmForfeit(true)}
              className="mt-1 h-10 px-4 rounded-xl bg-[#111319] border border-[#282a30] text-[#a98891] hover:text-rose-400 text-xs font-bold uppercase tracking-wider"
            >
              {ta("setup.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {finished && outcome && !reviewing && (
        <MatchResultModal
          outcome={outcome === "cancelled" ? "draw" : outcome}
          badge={t(`result.badge.${resultTitleKey}`)}
          title={t(`result.${resultTitleKey}`)}
          summary={t(`result.reason.${view.endReason ?? "none"}`)}
          secret={
            rivalSecret
              ? { label: t(outcome === "win" ? "result.secretDecrypted" : "result.secretWas"), digits: toDigits(rivalSecret) }
              : null
          }
          stats={[
            { label: ta("result.yourGuesses"), value: `${myMoves.length} / ${view.maxTurns}` },
            { label: t("result.rivalGuesses"), value: `${rivalMoves.length} / ${view.maxTurns}`, tone: "cyan" },
            { label: ta("result.picosPalas"), value: `${totalPicos} / ${totalPalas}`, tone: "gold" },
          ]}
          primary={
            outcome === "cancelled"
              ? { label: t("result.exit"), onClick: onExit }
              : {
                  label: rematchLabel,
                  icon: <RotateCcw className="w-5 h-5 shrink-0" />,
                  onClick: startRematch,
                  busy: rematchBusy,
                  disabled: rematchWaiting,
                  testId: "rematch",
                }
          }
          secondary={[
            { label: t("result.viewMatch"), icon: <Eye className="w-4 h-4 shrink-0" />, onClick: () => setReviewing(true), testId: "view-match" },
            ...(outcome === "cancelled" ? [] : [{ label: t("result.exit"), onClick: onExit, testId: "exit-match" }]),
          ]}
          footer={
            <div role="status" className="min-h-5 flex items-center justify-center gap-1.5 text-xs text-[#a98891]">
              {rematchError ? (
                <span role="alert" className="text-rose-400 font-bold">
                  {t(roomErrorKey(rematchError))}
                </span>
              ) : rematchWaiting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("result.rematchSent")}
                </>
              ) : rematch ? (
                <span className="text-[#ffb0ca] font-bold">{t("result.rematchOffered")}</span>
              ) : null}
            </div>
          }
        />
      )}

      <ConfirmDialog
        open={confirmForfeit}
        title={t("forfeitDialog.title")}
        description={t("forfeitDialog.description")}
        confirmLabel={t("forfeitDialog.confirm")}
        cancelLabel={t("forfeitDialog.cancel")}
        busy={forfeit.isPending}
        onConfirm={() => forfeit.mutate(undefined, { onSettled: () => setConfirmForfeit(false) })}
        onCancel={() => setConfirmForfeit(false)}
      />
    </div>
  );
}
