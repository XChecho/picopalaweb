'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Timer,
  Bot,
  User,
  Lock,
  EyeOff,
  Send,
  RotateCcw,
  Delete,
  Flag,
  Trophy,
  Skull,
  Handshake,
  Share2,
  Flame,
  Shuffle,
  X,
} from 'lucide-react';
import { Difficulty, GameMode, ILocalMove, MatchResult } from '@/types/game';
import { countRemainingCandidates, generateSecretNumber } from '@/lib/gameLogic';
import { MAX_ATTEMPTS, useMatchStore } from '@/store/useMatchStore';
import { soundEngine } from '@/lib/audio';

interface ArenaViewProps {
  mode?: GameMode;
  difficulty?: Difficulty;
  onMatchStart?: () => void;
  onMatchComplete?: (result: MatchResult) => void;
  onExitArena?: () => void;
}

const BOT_NAME = 'VORTEX-AI';

const RESULT_THEME = {
  win: {
    border: 'border-[#e9c400]/40',
    glow: 'bg-[#e9c400]/20',
    iconBg: 'bg-[#e9c400]/20 shadow-[0_0_40px_rgba(255,214,0,0.5)]',
    iconColor: 'text-[#ffe170]',
    badge: 'bg-[#e9c400] text-black',
    Icon: Trophy,
  },
  lose: {
    border: 'border-rose-500/40',
    glow: 'bg-rose-500/20',
    iconBg: 'bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.5)]',
    iconColor: 'text-rose-400',
    badge: 'bg-rose-500 text-white',
    Icon: Skull,
  },
  draw: {
    border: 'border-[#00d2ff]/40',
    glow: 'bg-[#00d2ff]/20',
    iconBg: 'bg-[#00d2ff]/20 shadow-[0_0_40px_rgba(0,210,255,0.5)]',
    iconColor: 'text-[#00d2ff]',
    badge: 'bg-[#00d2ff] text-black',
    Icon: Handshake,
  },
} as const;

const formatClock = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const pad2 = (n: number): string => String(n).padStart(2, '0');

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
  const boardRef = useRef<HTMLDivElement>(null);
  const previousPhaseRef = useRef(phase);
  const maxTurns = MAX_ATTEMPTS;

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

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        setWriteOpen(true);
        pressKey(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        if (!writeOpen) return;
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        setWriteOpen(false);
      } else if (e.key === 'Enter') {
        // Stop Enter from also "clicking" whichever button currently has focus.
        e.preventDefault();
        if (writeOpen) submitDraftGuess();
        else openWrite();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, currentDraft, writeOpen]);

  const handleNewDuel = () => {
    if (phase === 'playing' && !confirm(t('menu.confirmNewDuel'))) return;
    useMatchStore.getState().openSetup(storeDifficulty);
    setCurrentDraft([]);
    setErrorMsg(null);
    setWriteOpen(false);
    setShareCopied(false);
  };

  const handleLeave = () => {
    useMatchStore.getState().reset();
    onExitArena?.();
  };

  const handleForfeit = () => {
    if (!confirm(t('menu.confirmForfeit'))) return;
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
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider"
        >
          {t('unavailable.back')}
        </button>
      </div>
    );
  }

  const roundRows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="w-full flex flex-col select-none h-[calc(100dvh-5rem)] min-h-[520px]">
      {/* TOP BAR: turn indicator, status, clock and match actions */}
      <div className="shrink-0 border-b border-[#282a30] bg-[#0c0e14]/70 backdrop-blur">
        <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                data-testid="turn-indicator"
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#191b21] border border-[#282a30] font-['Cairo'] text-sm font-black text-white tabular-nums"
              >
                {t('turn', { n: pad2(turnCount), max: maxTurns })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                title={t('hud.clock')}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#191b21] border border-[#282a30]"
              >
                <Timer className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span
                  data-testid="turn-clock"
                  className={`font-mono text-xs font-bold tabular-nums ${
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
                className="w-8 h-8 rounded-full bg-[#191b21] hover:bg-[#282a30] border border-[#282a30] text-[#a98891] hover:text-white flex items-center justify-center transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleForfeit}
                title={t('menu.forfeit')}
                aria-label={t('menu.forfeit')}
                className="w-8 h-8 rounded-full bg-[#191b21] hover:bg-rose-950/40 border border-[#282a30] text-[#a98891] hover:text-rose-400 flex items-center justify-center transition-all"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-[#a98891]">
              <span
                data-testid="turn-status"
                data-state={statusState}
                className={`min-w-0 flex-1 truncate flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider border ${
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
            digits={null}
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
          className="flex-1 min-h-0 overflow-y-auto pr-0.5 pb-2 grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 content-start"
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
          <div className="flex items-center justify-center gap-4 text-[11px] text-[#a98891]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.7)]" />
              {t('hud.legendPico')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-[#ff479b]" />
              {t('hud.legendPala')}
            </span>
          </div>
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
                ? 'bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#00d2ff] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-[0.99]'
                : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            {canPlay ? t('write.button') : t('write.waiting')}
          </button>
        </div>
      </div>

      {/* WRITE-TURN MODAL (number pad) */}
      {writeOpen && canPlay && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setWriteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('write.title', { n: pad2(turnCount) })}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-[#191b21] border border-[#ff479b]/40 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-['Cairo'] font-bold text-sm text-[#ff479b] uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4" /> {t('write.title', { n: pad2(turnCount) })}
              </span>
              <button
                onClick={() => setWriteOpen(false)}
                aria-label={t('write.close')}
                className="w-8 h-8 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((slot) => {
                const filled = slot < currentDraft.length;
                const active = slot === currentDraft.length;
                return (
                  <div
                    key={slot}
                    className={`h-16 rounded-xl flex items-center justify-center font-['Cairo'] text-3xl font-black transition-all ${
                      filled
                        ? 'bg-[#282a30] border-2 border-[#ff479b] text-white shadow-[0_0_15px_rgba(255,71,155,0.3)]'
                        : active
                          ? 'bg-[#0c0e14] border-2 border-[#00d2ff] text-[#00d2ff] animate-pulse'
                          : 'bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40 opacity-60'
                    }`}
                  >
                    {filled ? currentDraft[slot] : active ? '_' : '·'}
                  </div>
                );
              })}
            </div>

            <span
              role={errorMsg ? 'alert' : undefined}
              className={`text-xs text-center ${errorMsg ? 'text-rose-400 font-bold' : 'text-[#a98891]'}`}
            >
              {errorMsg ?? t('write.hint', { count: Math.max(0, 4 - currentDraft.length) })}
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                const used = currentDraft.includes(n);
                return (
                  <button
                    key={n}
                    onClick={() => pressKey(n)}
                    disabled={used}
                    aria-label={`${t('write.digitAlpha')} ${n}`}
                    className={`h-14 rounded-xl font-['Cairo'] text-2xl font-black transition-all ${
                      used
                        ? 'bg-[#282a30] text-[#ff479b] opacity-40 cursor-not-allowed border border-[#33353b]'
                        : 'bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClear}
                className="h-11 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#a98891]" /> {t('write.clear')}
              </button>
              <button
                onClick={handleBackspace}
                className="h-11 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Delete className="w-3.5 h-3.5 text-rose-400" /> {t('write.undo')}
              </button>
            </div>

            <button
              onClick={submitDraftGuess}
              disabled={currentDraft.length < 4}
              className={`h-14 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                currentDraft.length === 4
                  ? 'bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#00d2ff] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-95'
                  : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
              }`}
            >
              {t('write.submit')} <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECRET SETUP MODAL */}
      {phase === 'setup' && (
        <SecretSetupModal
          botName={BOT_NAME}
          levelLabel={levelLabel}
          onLock={(secret) => {
            soundEngine.playSubmit();
            useMatchStore.getState().lockSecret(secret);
          }}
          onCancel={handleLeave}
        />
      )}

      {/* COIN TOSS MODAL */}
      {phase === 'toss' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.4)] animate-bounce">
              <Flame className="w-10 h-10 text-[#ffe170]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
                {t('toss.title')}
              </span>
              <span className="text-sm text-[#a98891]">
                {starter === 'PLAYER' ? t('toss.playerWon') : t('toss.botWon', { name: BOT_NAME })}
              </span>
            </div>
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
              onClick={() => useMatchStore.getState().beginPlay()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {t('toss.enter')}
            </button>
          </div>
        </div>
      )}

      {/* RESULT MODAL (victory / defeat / draw) */}
      {phase === 'finished' && result && (
        <ResultModal
          result={result}
          botName={BOT_NAME}
          opponentSecret={opponentSecret}
          playerGuesses={playerMoves.length}
          botGuesses={botMoves.length}
          maxTurns={maxTurns}
          totalPicos={totalPicos}
          totalPalas={totalPalas}
          shareCopied={shareCopied}
          onNext={handleNewDuel}
          onShare={handleShare}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */

interface ColumnHeaderProps {
  side: 'opponent' | 'you';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  digits: number[] | null;
  secretLabel: string;
  attemptsLabel: string;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  side,
  title,
  subtitle,
  icon,
  digits,
  secretLabel,
  attemptsLabel,
}) => (
  <div
    data-testid={`column-${side}`}
    className={`rounded-2xl border p-2 sm:p-3 flex flex-col gap-2 min-w-0 ${
      side === 'you'
        ? 'bg-gradient-to-br from-[#e9c400]/10 via-[#191b21] to-[#191b21] border-[#e9c400]/30'
        : 'bg-[#191b21] border-[#282a30]'
    }`}
  >
    <div className="flex items-center justify-between gap-1 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-7 h-7 shrink-0 rounded-lg bg-[#282a30] flex items-center justify-center">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="font-['Cairo'] text-xs sm:text-sm font-black text-white uppercase leading-tight truncate">
            {title}
          </span>
          <span className="text-[10px] text-[#a98891] leading-tight truncate">{subtitle}</span>
        </div>
      </div>
      <span className="shrink-0 text-[10px] font-bold text-[#a98891] tabular-nums">{attemptsLabel}</span>
    </div>

    <div className="flex items-center justify-center gap-1" aria-label={secretLabel}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-7 h-8 sm:w-8 sm:h-9 rounded-lg border flex items-center justify-center font-['Cairo'] text-base font-black ${
            digits
              ? 'bg-[#282a30] border-white/10 text-[#ffe170]'
              : 'bg-[#111319] border-white/5 text-[#a98891]'
          }`}
        >
          {digits ? digits[i] : '?'}
        </span>
      ))}
      {digits ? (
        <EyeOff className="w-3.5 h-3.5 text-[#a98891] ml-1 hidden sm:block" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-[#a98891] ml-1 hidden sm:block" />
      )}
    </div>
  </div>
);

interface BoardCellProps {
  actor: 'BOT' | 'YOU';
  move: ILocalMove | undefined;
  round: number;
  pending: string | null;
}

const BoardCell: React.FC<BoardCellProps> = ({ actor, move, round, pending }) => {
  if (!move) {
    return pending ? (
      <div className="rounded-xl border border-dashed border-[#ff479b]/50 bg-[#ff479b]/5 p-2 flex items-center justify-center gap-2 min-h-[68px] animate-pulse">
        <span className="text-[10px] font-bold text-[#a98891]">#{pad2(round)}</span>
        <span className="text-xs font-bold text-[#ffb0ca] uppercase tracking-wider truncate">{pending}</span>
      </div>
    ) : (
      <div aria-hidden className="min-h-[68px]" />
    );
  }

  const { picos, palas } = move.feedback;
  const misses = 4 - picos - palas;

  return (
    <div
      data-testid="move"
      data-actor={actor}
      data-guess={move.guess}
      data-picos={picos}
      data-palas={palas}
      className={`rounded-xl border p-2 flex flex-col gap-1.5 min-h-[68px] ${
        actor === 'YOU'
          ? 'bg-[#111319] border-[#282a30]'
          : 'bg-[#282a30]/50 border-transparent'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-[#a98891] tabular-nums w-5 shrink-0">#{pad2(round)}</span>
        <div className="flex items-center gap-1">
          {move.guess.split('').map((d, i) => (
            <span
              key={i}
              className="w-6 h-7 sm:w-7 sm:h-8 rounded-md bg-[#0c0e14] border border-white/5 flex items-center justify-center font-['Cairo'] font-black text-sm text-white"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 pl-6">
        <div className="flex items-center gap-1">
          {Array.from({ length: picos }).map((_, i) => (
            <span
              key={`p${i}`}
              className="w-3 h-3 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.8)]"
            />
          ))}
          {Array.from({ length: palas }).map((_, i) => (
            <span
              key={`l${i}`}
              className="w-3 h-3 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_6px_rgba(255,71,155,0.7)]"
            />
          ))}
          {Array.from({ length: misses }).map((_, i) => (
            <span key={`m${i}`} className="w-2 h-2 rounded-full bg-[#33353b]" />
          ))}
        </div>
        <span className="text-[11px] font-bold text-[#e2bdc7] tabular-nums whitespace-nowrap">
          {picos > 0 && `${picos}P `}
          {palas > 0 && `${palas}L`}
          {picos === 0 && palas === 0 && '0'}
        </span>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */

interface ResultModalProps {
  result: MatchResult;
  botName: string;
  opponentSecret: number[];
  playerGuesses: number;
  botGuesses: number;
  maxTurns: number;
  totalPicos: number;
  totalPalas: number;
  shareCopied: boolean;
  onNext: () => void;
  onShare: () => void;
  onLeave: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  result,
  botName,
  opponentSecret,
  playerGuesses,
  botGuesses,
  maxTurns,
  totalPicos,
  totalPalas,
  shareCopied,
  onNext,
  onShare,
  onLeave,
}) => {
  const { t } = useTranslation('arena');
  const theme = RESULT_THEME[result];
  const ResultIcon = theme.Icon;
  const count = result === 'lose' ? botGuesses : playerGuesses;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div
        className={`max-w-lg w-full bg-[#191b21] border ${theme.border} rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden`}
      >
        <div className={`absolute -top-20 -left-20 w-56 h-56 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#ff479b]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme.iconBg}`}>
            <ResultIcon className={`w-12 h-12 ${theme.iconColor}`} />
          </div>
          <span
            className={`absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full ${theme.badge} font-['Cairo'] text-xs font-black uppercase`}
          >
            {t(`result.${result}.badge`)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span
            data-testid="result-title"
            data-result={result}
            className="font-['Cairo'] text-3xl font-black text-white uppercase tracking-tight"
          >
            {t(`result.${result}.title`)}
          </span>
          <span className="text-sm text-[#e2bdc7]">{t(`result.${result}.summary`, { count, name: botName })}</span>
        </div>

        <div className="w-full p-4 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
            {result === 'win' ? t('result.secretDecrypted') : t('result.secretWas')}
          </span>
          <div className="flex items-center gap-2">
            {opponentSecret.map((d, i) => (
              <div
                key={i}
                className="w-12 h-14 rounded-xl bg-[#282a30] border border-white/10 flex items-center justify-center shadow-md font-['Cairo'] text-2xl font-black text-[#ffe170]"
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
            <span className="text-[11px] text-[#a98891]">{t('result.yourGuesses')}</span>
            <span className="font-['Cairo'] text-base font-bold text-white">
              {playerGuesses} / {maxTurns}
            </span>
          </div>
          <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
            <span className="text-[11px] text-[#a98891]">{t('result.botGuesses')}</span>
            <span className="font-['Cairo'] text-base font-bold text-[#00d2ff]">
              {botGuesses} / {maxTurns}
            </span>
          </div>
          <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
            <span className="text-[11px] text-[#a98891]">{t('result.picosPalas')}</span>
            <span className="font-['Cairo'] text-base font-bold text-[#ffe170]">
              {totalPicos} / {totalPalas}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onNext}
            className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> {t('result.playNext')}
          </button>
          {result === 'win' && (
            <button
              onClick={onShare}
              className="w-full sm:w-auto px-5 h-12 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> {shareCopied ? t('result.copied') : t('result.share')}
            </button>
          )}
          <button
            onClick={onLeave}
            className="w-full sm:w-auto px-5 h-12 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all"
          >
            {t('result.hub')}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */

interface SecretSetupModalProps {
  botName: string;
  levelLabel: string;
  onLock: (secret: string) => void;
  onCancel: () => void;
}

const SecretSetupModal: React.FC<SecretSetupModalProps> = ({ botName, levelLabel, onLock, onCancel }) => {
  const { t } = useTranslation('arena');
  const [draft, setDraft] = useState<number[]>([]);

  const press = (n: number) => {
    setDraft((prev) => (prev.includes(n) || prev.length >= 4 ? prev : [...prev, n]));
  };
  const lock = () => {
    if (draft.length === 4) onLock(draft.join(''));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        press(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setDraft((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        lock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-md bg-[#191b21] border border-[#33353b] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.3)]">
          <Lock className="w-7 h-7 text-[#ffe170]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Cairo'] text-2xl font-black uppercase text-white">{t('setup.title')}</span>
          <span className="text-sm text-[#a98891]">{t('setup.text', { name: botName, level: levelLabel })}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-16 rounded-xl flex items-center justify-center font-['Cairo'] text-3xl font-black ${
                i < draft.length
                  ? 'bg-[#282a30] border-2 border-[#e9c400] text-[#ffe170]'
                  : 'bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40'
              }`}
            >
              {i < draft.length ? draft[i] : '·'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const used = draft.includes(n);
            return (
              <button
                key={n}
                onClick={() => press(n)}
                disabled={used}
                className={`h-12 rounded-xl font-['Cairo'] text-xl font-black transition-all ${
                  used
                    ? 'bg-[#282a30] text-[#ff479b] opacity-40 cursor-not-allowed'
                    : 'bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={() => setDraft((prev) => prev.slice(0, -1))}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#e2e2ea] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Delete className="w-3.5 h-3.5" /> {t('setup.undo')}
          </button>
          <button
            onClick={() => setDraft(generateSecretNumber().split('').map(Number))}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#e2e2ea] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" /> {t('setup.random')}
          </button>
          <button
            onClick={onCancel}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#a98891] text-xs font-bold uppercase tracking-wider"
          >
            {t('setup.cancel')}
          </button>
        </div>

        <button
          onClick={lock}
          disabled={draft.length < 4}
          className={`w-full py-3 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all ${
            draft.length === 4
              ? 'bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white shadow-lg hover:brightness-110 active:scale-95'
              : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
          }`}
        >
          {t('setup.lock')}
        </button>
      </div>
    </div>
  );
};
