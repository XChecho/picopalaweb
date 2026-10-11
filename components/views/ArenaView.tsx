'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Timer,
  Bot,
  User,
  Send,
  RotateCcw,
  Flag,
  Trophy,
  Share2,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Difficulty, GameMode, MatchResult } from '@/types/game';
import { countRemainingCandidates } from '@/lib/gameLogic';
import { MAX_ATTEMPTS, useMatchStore } from '@/store/useMatchStore';
import { soundEngine } from '@/lib/audio';
import { buildMatchRecord } from '@/lib/matchRecord';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSaveMatch } from '@/hooks/useSaveMatch';
import { CoinFlip } from '@/components/arena/CoinFlip';
import { TurnComposer } from '@/components/arena/TurnComposer';
import { ColumnHeader } from '@/components/arena/ColumnHeader';
import { BoardCell } from '@/components/arena/BoardCell';
import { WriteTurnModal } from '@/components/arena/WriteTurnModal';
import { SecretSetupModal } from '@/components/arena/SecretSetupModal';
import { MatchResultModal } from '@/components/arena/MatchResultModal';

interface ArenaViewProps {
  mode?: GameMode;
  difficulty?: Difficulty;
  onMatchStart?: () => void;
  onMatchComplete?: (result: MatchResult) => void;
  onExitArena?: () => void;
}

const BOT_NAME = 'VORTEX-AI';

const formatClock = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const pad2 = (n: number): string => String(n).padStart(2, '0');

const SaveStatus: React.FC<{ status: 'idle' | 'saving' | 'saved' | 'error'; onRetry: () => void }> = ({
  status,
  onRetry,
}) => {
  const { t } = useTranslation('arena');
  return (
    <div
      data-testid="save-status"
      data-state={status}
      role="status"
      className="min-h-5 flex items-center justify-center gap-1.5 text-xs text-[#a98891]"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('result.saving')}
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('result.saved')}
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-400">{t('result.saveFailed')}</span>
          <button onClick={onRetry} className="underline font-bold text-white hover:text-[#ffb0ca]">
            {t('result.retry')}
          </button>
        </>
      )}
    </div>
  );
};

export const ArenaView: React.FC<ArenaViewProps> = ({
  mode = 'ai',
  difficulty = 'grandmaster',
  onMatchStart,
  onMatchComplete,
  onExitArena,
}) => {
  const { t } = useTranslation('arena');

  const phase = useMatchStore((s) => s.phase);
  const storeDifficulty = useMatchStore((s) => s.difficulty);
  const playerSecretStr = useMatchStore((s) => s.playerSecret);
  const opponentSecretStr = useMatchStore((s) => s.opponentSecret);
  const moves = useMatchStore((s) => s.moves);
  const starter = useMatchStore((s) => s.starter);
  const currentActor = useMatchStore((s) => s.currentActor);
  const playerAttemptsLeft = useMatchStore((s) => s.playerAttemptsLeft);
  const aiAttemptsLeft = useMatchStore((s) => s.aiAttemptsLeft);
  const result = useMatchStore((s) => s.result);
  const isBotThinking = useMatchStore((s) => s.isAIThinking);
  const timeRemaining = useMatchStore((s) => s.timeRemaining);
  const timeUp = useMatchStore((s) => s.timeUp);

  const [currentDraft, setCurrentDraft] = useState<number[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [tossLanded, setTossLanded] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const saveMatch = useSaveMatch();
  const savedMatchIdRef = useRef('');
  const boardRef = useRef<HTMLDivElement>(null);
  const previousPhaseRef = useRef(phase);
  const maxTurns = MAX_ATTEMPTS;

  const saveStatus = (saveMatch.isError ? 'error' : saveMatch.isSuccess ? 'saved' : saveMatch.isIdle ? 'idle' : 'saving') as
    | 'idle'
    | 'saving'
    | 'saved'
    | 'error';

  const canPlay = phase === 'playing' && currentActor === 'PLAYER' && !isBotThinking;
  const levelLabel = t(`level.${storeDifficulty}`);

  const playerSecret = useMemo(() => playerSecretStr.split('').map(Number), [playerSecretStr]);
  const opponentSecret = useMemo(() => opponentSecretStr.split('').map(Number), [opponentSecretStr]);

  const playerMoves = useMemo(() => moves.filter((move) => move.isPlayerMove), [moves]);
  const botMoves = useMemo(() => moves.filter((move) => !move.isPlayerMove), [moves]);
  const totalPicos = playerMoves.reduce((sum, move) => sum + move.feedback.picos, 0);
  const totalPalas = playerMoves.reduce((sum, move) => sum + move.feedback.palas, 0);
  const remainingCandidates = useMemo(() => countRemainingCandidates(playerMoves), [playerMoves]);

  // One round = one guess from each side; the top bar shows the current round.
  const turnCount = Math.min(maxTurns, Math.floor(moves.length / 2) + 1);

  // Rows of the two-column board, aligned by round (opponent left, player right).
  const botSlots = botMoves.length + (phase === 'playing' && currentActor === 'AI' ? 1 : 0);
  const playerSlots = playerMoves.length + (phase === 'playing' && currentActor === 'PLAYER' ? 1 : 0);
  const rowCount = Math.max(botSlots, playerSlots, 1);

  const statusState =
    phase === 'finished'
      ? 'finished'
      : phase !== 'playing'
        ? 'preparing'
        : isBotThinking
          ? 'thinking'
          : currentActor === 'PLAYER'
            ? 'your-turn'
            : 'opponent';

  const statusText = {
    finished: t('status.finished'),
    preparing: t('status.preparing'),
    thinking: t('status.thinking', { name: BOT_NAME }),
    'your-turn': t('status.yourTurn'),
    opponent: t('status.opponentTurn'),
  }[statusState];

  const timerLabel =
    storeDifficulty !== 'grandmaster' || phase !== 'playing'
      ? '∞'
      : currentActor === 'PLAYER'
        ? formatClock(timeRemaining)
        : '--:--';

  // Start a fresh setup the first time the arena opens without a match in memory.
  useEffect(() => {
    if (mode === 'ai' && useMatchStore.getState().phase === 'idle') {
      useMatchStore.getState().openSetup(difficulty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tell the app shell when the match starts / ends; play the end-of-match sound once.
  useEffect(() => {
    const previous = previousPhaseRef.current;
    previousPhaseRef.current = phase;

    if (phase === 'playing' && previous !== 'playing') onMatchStart?.();
    if (phase === 'finished' && result) {
      onMatchComplete?.(result);
      if (previous !== 'finished') {
        if (result === 'lose') soundEngine.playErrorBuzz();
        else soundEngine.playVictoryFanfare();
      }
    }
  }, [phase, result, onMatchStart, onMatchComplete]);

  // Every web match is stored (the web always has a connection); the backend dedupes by match id.
  useEffect(() => {
    if (phase !== 'finished' || !result) return;
    const snapshot = useMatchStore.getState();
    if (!snapshot.matchId || savedMatchIdRef.current === snapshot.matchId) return;
    const record = buildMatchRecord(snapshot, result);
    if (!record) return;
    savedMatchIdRef.current = snapshot.matchId;
    saveMatch.mutate(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result]);

  const retrySave = () => {
    const snapshot = useMatchStore.getState();
    if (!snapshot.result) return;
    const record = buildMatchRecord(snapshot, snapshot.result);
    if (record) saveMatch.mutate(record);
  };

  // Abandoning a started match counts as a loss (same rule the forfeit confirmation states).
  const recordForfeit = () => {
    const snapshot = useMatchStore.getState();
    if (snapshot.phase !== 'playing') return;
    const record = buildMatchRecord({ ...snapshot, finishedAt: Date.now() }, 'lose', { forfeit: true });
    if (record) saveMatch.mutate(record);
  };

  // One-second clock (only runs a countdown for the Grandmaster level).
  useEffect(() => {
    const interval = setInterval(() => useMatchStore.getState().tick(), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timeUp) return;
    setCurrentDraft([]);
    setWriteOpen(false);
    setErrorMsg(t('errors.timeUp'));
    useMatchStore.getState().clearTimeUp();
  }, [timeUp, t]);

  // The keypad can only be open while it is the player's turn.
  useEffect(() => {
    if (!canPlay) setWriteOpen(false);
  }, [canPlay]);

  useEffect(() => {
    const board = boardRef.current;
    if (board) board.scrollTop = board.scrollHeight;
  }, [rowCount]);

  const pressKey = (num: number) => {
    if (!canPlay || currentDraft.includes(num) || currentDraft.length >= 4) return;
    soundEngine.playKeypad();
    setCurrentDraft((prev) => [...prev, num]);
    setErrorMsg(null);
  };

  const handleBackspace = () => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setCurrentDraft((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setCurrentDraft([]);
    setErrorMsg(null);
  };

  const openWrite = () => {
    if (!canPlay) return;
    setErrorMsg(null);
    setWriteOpen(true);
  };

  const submitDraftGuess = () => {
    if (!canPlay) return;

    const outcome = useMatchStore.getState().submitGuess(currentDraft.join(''));
    if (!outcome.ok) {
      soundEngine.playErrorBuzz();
      setErrorMsg(t(`errors.${outcome.error}`));
      return;
    }

    soundEngine.playSubmit();
    const last = useMatchStore.getState().moves.filter((move) => move.isPlayerMove).at(-1);
    if (last && last.feedback.picos > 0) soundEngine.playPicoChime();
    else if (last && last.feedback.palas > 0) soundEngine.playPalaPing();

    setCurrentDraft([]);
    setErrorMsg(null);
    setWriteOpen(false);
  };

  // Physical keyboard: digits open the keypad, Enter submits, Escape closes it.
  useEffect(() => {
    if (!canPlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // On wide screens the composer is always visible, so there is no modal to open first.
      const composerOpen = isDesktop || writeOpen;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        if (!isDesktop) setWriteOpen(true);
        pressKey(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        if (!composerOpen) return;
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        if (isDesktop) handleClear();
        else setWriteOpen(false);
      } else if (e.key === 'Enter') {
        // Stop Enter from also "clicking" whichever button currently has focus.
        e.preventDefault();
        if (composerOpen) submitDraftGuess();
        else openWrite();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, currentDraft, writeOpen, isDesktop]);

  const handleNewDuel = () => {
    if (phase === 'playing' && !confirm(t('menu.confirmNewDuel'))) return;
    recordForfeit();
    saveMatch.reset();
    setReviewing(false);
    useMatchStore.getState().openSetup(storeDifficulty);
    setCurrentDraft([]);
    setErrorMsg(null);
    setWriteOpen(false);
    setShareCopied(false);
  };

  const handleLeave = () => {
    if (saveMatch.isError && !confirm(t('result.confirmLeaveUnsaved'))) return;
    useMatchStore.getState().reset();
    onExitArena?.();
  };

  const handleForfeit = () => {
    if (!confirm(t('menu.confirmForfeit'))) return;
    recordForfeit();
    useMatchStore.getState().reset();
    onMatchComplete?.('lose');
    onExitArena?.();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(t('result.shareText', { count: playerMoves.length }));
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  };

  if (mode !== 'ai') {
    return (
      <div className="max-w-xl w-full mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
          {t('unavailable.title')}
        </span>
        <p className="text-sm text-[#a98891]">{t('unavailable.text')}</p>
        <button
          onClick={onExitArena}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider"
        >
          {t('unavailable.back')}
        </button>
      </div>
    );
  }

  const roundRows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="w-full flex flex-col select-none h-[calc(100dvh-5rem)] overflow-hidden [@media(max-height:560px)]:h-auto [@media(max-height:560px)]:min-h-[calc(100dvh-5rem)] [@media(max-height:560px)]:overflow-visible">
      {/* TOP BAR: turn indicator, status, clock and match actions */}
      <div className="shrink-0 border-b border-[#282a30] bg-[#0c0e14]/70 backdrop-blur">
        <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                data-testid="turn-indicator"
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#191b21] border border-[#282a30] font-['Cairo'] text-base font-black text-white tabular-nums"
              >
                {t('turn', { n: pad2(turnCount), max: maxTurns })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                title={t('hud.clock')}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#191b21] border border-[#282a30]"
              >
                <Timer className="w-4 h-4 text-[#00d2ff]" />
                <span
                  data-testid="turn-clock"
                  className={`font-mono text-sm font-bold tabular-nums ${
                    storeDifficulty === 'grandmaster' && currentActor === 'PLAYER' && timeRemaining <= 10
                      ? 'text-[#ff4d4d]'
                      : 'text-[#00d2ff]'
                  }`}
                >
                  {timerLabel}
                </span>
              </div>
              <button
                onClick={handleNewDuel}
                title={t('menu.newDuel')}
                aria-label={t('menu.newDuel')}
                className="w-9 h-9 rounded-full bg-[#191b21] hover:bg-[#282a30] border border-[#282a30] text-[#a98891] hover:text-white flex items-center justify-center transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleForfeit}
                title={t('menu.forfeit')}
                aria-label={t('menu.forfeit')}
                className="w-9 h-9 rounded-full bg-[#191b21] hover:bg-rose-950/40 border border-[#282a30] text-[#a98891] hover:text-rose-400 flex items-center justify-center transition-all"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-[#a98891]">
              <span
                data-testid="turn-status"
                data-state={statusState}
                className={`min-w-0 flex-1 truncate flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border ${
                  statusState === 'your-turn'
                    ? 'bg-[#ff479b]/15 border-[#ff479b]/50 text-[#ffb0ca] shadow-[0_0_12px_rgba(255,46,149,0.3)]'
                    : 'bg-[#111319] border-[#282a30] text-[#00d2ff]'
                }`}
              >
                <span
                  className={`w-2 h-2 shrink-0 rounded-full ${
                    statusState === 'your-turn'
                      ? 'bg-[#ff479b] animate-pulse'
                      : statusState === 'thinking'
                        ? 'bg-[#00d2ff] animate-ping'
                        : 'bg-[#a98891]'
                  }`}
                />
                <span className="truncate">{statusText}</span>
              </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#111319] border border-[#282a30]">
              <span className="text-[#ffe170] font-bold tabular-nums">
                {t('hud.candidates', { count: remainingCandidates })}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* BOARD: opponent on the left, player on the right */}
      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-2 sm:px-4 pt-2 flex flex-col gap-2">
        <div className="shrink-0 grid grid-cols-2 gap-2 sm:gap-4">
          <ColumnHeader
            side="opponent"
            title={t('columns.opponent')}
            subtitle={`${BOT_NAME} · ${levelLabel}`}
            icon={<Bot className="w-4 h-4 text-[#00d2ff]" />}
            digits={phase === 'finished' && opponentSecret.length === 4 ? opponentSecret : null}
            secretLabel={t('columns.secretHidden')}
            attemptsLabel={t('columns.guessesLeft', { n: aiAttemptsLeft })}
          />
          <ColumnHeader
            side="you"
            title={t('columns.you')}
            subtitle={t('columns.yourSecret')}
            icon={<User className="w-4 h-4 text-[#ff479b]" />}
            digits={playerSecret.length === 4 ? playerSecret : null}
            secretLabel={t('columns.yourSecret')}
            attemptsLabel={t('columns.guessesLeft', { n: playerAttemptsLeft })}
          />
        </div>

        <div
          ref={boardRef}
          data-testid="board"
          className="flex-1 min-h-0 overflow-y-auto [@media(max-height:560px)]:overflow-visible pr-0.5 pb-2 grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 content-start"
        >
          {roundRows.map((i) => (
            <React.Fragment key={i}>
              <BoardCell
                actor="BOT"
                move={botMoves[i]}
                round={i + 1}
                pending={
                  !botMoves[i] && i === botMoves.length && phase === 'playing' && currentActor === 'AI'
                    ? t('columns.pendingBot')
                    : null
                }
              />
              <BoardCell
                actor="YOU"
                move={playerMoves[i]}
                round={i + 1}
                pending={
                  !playerMoves[i] &&
                  i === playerMoves.length &&
                  phase === 'playing' &&
                  currentActor === 'PLAYER'
                    ? t('columns.pendingYou')
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
              {t('hud.legendPico')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-[#ff479b]" />
              {t('hud.legendPala')}
            </span>
          </div>
          {phase === 'finished' ? (
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <button
                onClick={() => setReviewing(false)}
                className="h-12 sm:flex-1 px-5 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" /> {t('result.showResult')}
              </button>
              <button
                onClick={handleNewDuel}
                className="h-12 sm:flex-1 px-5 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> {t('result.playNext')}
              </button>
              <button
                onClick={handleLeave}
                className="h-12 sm:flex-1 px-5 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t('result.hub')}
              </button>
            </div>
          ) : isDesktop ? (
            <TurnComposer
              draft={currentDraft}
              canPlay={canPlay}
              errorMsg={errorMsg}
              turnLabel={t('write.title', { n: pad2(turnCount) })}
              onPress={pressKey}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSubmit={submitDraftGuess}
            />
          ) : (
            <>
              {errorMsg && !writeOpen && (
                <span role="alert" className="text-xs font-bold text-rose-400 text-center">
                  {errorMsg}
                </span>
              )}
              <button
                onClick={openWrite}
                disabled={!canPlay}
                className={`w-full h-14 rounded-2xl font-['Cairo'] font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  canPlay
                    ? 'bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-[0.99]'
                    : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                {canPlay ? t('write.button') : t('write.waiting')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* WRITE-TURN MODAL (number pad) */}
      {!isDesktop && writeOpen && canPlay && (
        <WriteTurnModal
          turnLabel={t('write.title', { n: pad2(turnCount) })}
          draft={currentDraft}
          errorMsg={errorMsg}
          onPress={pressKey}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={submitDraftGuess}
          onClose={() => setWriteOpen(false)}
        />
      )}

      {/* SECRET SETUP MODAL */}
      {phase === 'setup' && (
        <SecretSetupModal
          description={t('setup.text', { name: BOT_NAME, level: levelLabel })}
          onLock={(secret) => {
            soundEngine.playSubmit();
            useMatchStore.getState().lockSecret(secret);
          }}
          onCancel={handleLeave}
        />
      )}

      {/* COIN TOSS MODAL: a 2 s coin flip, then the result is revealed */}
      {phase === 'toss' && starter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <CoinFlip
              starter={starter}
              playerLabel={t('toss.coinYou')}
              botLabel={t('toss.coinBot')}
              onLanded={() => setTossLanded(true)}
            />
            <div className="flex flex-col gap-1">
              <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
                {t('toss.title')}
              </span>
              <span className="text-sm text-[#a98891] min-h-5" aria-live="polite">
                {tossLanded
                  ? starter === 'PLAYER'
                    ? t('toss.playerWon')
                    : t('toss.botWon', { name: BOT_NAME })
                  : t('toss.flipping')}
              </span>
            </div>
            <div
              className={`w-full flex flex-col gap-4 transition-all duration-500 ${
                tossLanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-full py-3 bg-[#111319] rounded-2xl flex items-center justify-around text-xs font-bold">
                <span className="text-[#ff479b]">
                  {t('toss.yourMove', { order: starter === 'PLAYER' ? t('toss.first') : t('toss.second') })}
                </span>
                <span className="text-[#33353b]">|</span>
                <span className="text-[#00d2ff]">
                  {t('toss.botMove', { order: starter === 'PLAYER' ? t('toss.second') : t('toss.first') })}
                </span>
              </div>
              <button
                onClick={() => {
                  setTossLanded(false);
                  useMatchStore.getState().beginPlay();
                }}
                disabled={!tossLanded}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                {t('toss.enter')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL (victory / defeat / draw) */}
      {phase === 'finished' && result && !reviewing && (
        <MatchResultModal
          outcome={result}
          badge={t(`result.${result}.badge`)}
          title={t(`result.${result}.title`)}
          summary={t(`result.${result}.summary`, {
            count: result === 'lose' ? botMoves.length : playerMoves.length,
            name: BOT_NAME,
          })}
          secret={{
            label: result === 'win' ? t('result.secretDecrypted') : t('result.secretWas'),
            digits: opponentSecret,
          }}
          stats={[
            { label: t('result.yourGuesses'), value: `${playerMoves.length} / ${maxTurns}` },
            { label: t('result.botGuesses'), value: `${botMoves.length} / ${maxTurns}`, tone: 'cyan' },
            { label: t('result.picosPalas'), value: `${totalPicos} / ${totalPalas}`, tone: 'gold' },
          ]}
          primary={{
            label: t('result.playNext'),
            icon: <RotateCcw className="w-5 h-5 shrink-0" />,
            onClick: handleNewDuel,
            disabled: saveStatus === 'saving',
          }}
          secondary={[
            { label: t('result.viewMatch'), icon: <Eye className="w-4 h-4 shrink-0" />, onClick: () => setReviewing(true) },
            ...(result === 'win'
              ? [
                  {
                    label: shareCopied ? t('result.copied') : t('result.share'),
                    icon: <Share2 className="w-4 h-4 shrink-0" />,
                    onClick: handleShare,
                  },
                ]
              : []),
            { label: t('result.hub'), onClick: handleLeave, disabled: saveStatus === 'saving' },
          ]}
          footer={<SaveStatus status={saveStatus} onRetry={retrySave} />}
        />
      )}
    </div>
  );
};
