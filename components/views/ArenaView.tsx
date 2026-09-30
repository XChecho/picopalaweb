'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Timer,
  Bot,
  Lock,
  EyeOff,
  History,
  Send,
  RotateCcw,
  Delete,
  Flag,
  Trophy,
  Skull,
  Handshake,
  Share2,
  Check,
  Flame,
  Shuffle,
} from 'lucide-react';
import { Difficulty, GameMode, MatchResult, TurnRecord } from '@/types/game';
import { countRemainingCandidates, generateSecretNumber } from '@/lib/gameLogic';
import { MAX_ATTEMPTS, useMatchStore, type TSubmitError } from '@/store/useMatchStore';
import { soundEngine } from '@/lib/audio';

interface ArenaViewProps {
  mode?: GameMode;
  difficulty?: Difficulty;
  onMatchStart?: () => void;
  onMatchComplete?: (result: MatchResult) => void;
  onExitArena?: () => void;
}

const DIFFICULTY_META: Record<Difficulty, { label: string; botLine: string }> = {
  novice: { label: 'Novice', botLine: 'Bot · Easy' },
  tactician: { label: 'Tactician', botLine: 'Bot · Medium' },
  grandmaster: { label: 'Grandmaster', botLine: 'Bot · Hard · 60s per turn' },
};

const ERROR_MESSAGES: Record<TSubmitError, string> = {
  NOT_YOUR_TURN: 'Wait for your turn.',
  INVALID_LENGTH: 'INVALID INPUT: Exactly 4 unique digits (1–9) required!',
  INVALID_DIGITS: 'INVALID INPUT: Only digits 1–9 are allowed!',
  REPEATED_DIGITS: 'INVALID INPUT: Digits cannot repeat!',
  DUPLICATE_GUESS: 'You already tried that number. Pick a different one.',
};

const RESULT_THEME = {
  win: {
    border: 'border-[#e9c400]/40',
    glow: 'bg-[#e9c400]/20',
    iconBg: 'bg-[#e9c400]/20 shadow-[0_0_40px_rgba(255,214,0,0.5)]',
    iconColor: 'text-[#ffe170]',
    badge: 'bg-[#e9c400] text-black',
    badgeText: 'VICTORY',
    title: 'CIPHER CRACKED!',
    Icon: Trophy,
  },
  lose: {
    border: 'border-rose-500/40',
    glow: 'bg-rose-500/20',
    iconBg: 'bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.5)]',
    iconColor: 'text-rose-400',
    badge: 'bg-rose-500 text-white',
    badgeText: 'DEFEAT',
    title: 'YOUR CIPHER WAS BROKEN',
    Icon: Skull,
  },
  draw: {
    border: 'border-[#00d2ff]/40',
    glow: 'bg-[#00d2ff]/20',
    iconBg: 'bg-[#00d2ff]/20 shadow-[0_0_40px_rgba(0,210,255,0.5)]',
    iconColor: 'text-[#00d2ff]',
    badge: 'bg-[#00d2ff] text-black',
    badgeText: 'DRAW',
    title: 'TACTICAL DRAW',
    Icon: Handshake,
  },
} as const;

const formatClock = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const ArenaView: React.FC<ArenaViewProps> = ({
  mode = 'ai',
  difficulty = 'grandmaster',
  onMatchStart,
  onMatchComplete,
  onExitArena,
}) => {
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
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const ledgerRef = useRef<HTMLDivElement>(null);
  const previousPhaseRef = useRef(phase);
  const maxTurns = MAX_ATTEMPTS;

  const canPlay = phase === 'playing' && currentActor === 'PLAYER' && !isBotThinking;
  const difficultyMeta = DIFFICULTY_META[storeDifficulty];

  const playerSecret = useMemo(() => playerSecretStr.split('').map(Number), [playerSecretStr]);
  const opponentSecret = useMemo(() => opponentSecretStr.split('').map(Number), [opponentSecretStr]);

  const ledger: TurnRecord[] = useMemo(
    () =>
      moves.map((move) => ({
        id: String(move.turnNumber),
        turnNumber: move.turnNumber,
        actor: move.isPlayerMove ? 'YOU' : 'BOT',
        actorName: move.isPlayerMove ? 'You' : 'VORTEX-AI',
        guess: move.guess.split('').map(Number),
        picos: move.feedback.picos,
        palas: move.feedback.palas,
        misses: 4 - move.feedback.picos - move.feedback.palas,
        timestamp: '',
      })),
    [moves],
  );

  const playerMoves = useMemo(() => moves.filter((move) => move.isPlayerMove), [moves]);
  const totalPicos = playerMoves.reduce((sum, move) => sum + move.feedback.picos, 0);
  const totalPalas = playerMoves.reduce((sum, move) => sum + move.feedback.palas, 0);
  const remainingCandidates = useMemo(() => countRemainingCandidates(playerMoves), [playerMoves]);

  // Round number shown in the gauge: one round = one guess from each side.
  const turnCount = Math.min(maxTurns, Math.floor(moves.length / 2) + 1);
  const windowStart = Math.max(1, Math.min(moves.length - 2, maxTurns * 2 - 7));
  const timelineSteps = Array.from({ length: 8 }, (_, i) => windowStart + i);

  const timerLabel =
    storeDifficulty !== 'grandmaster' || phase !== 'playing'
      ? '∞'
      : currentActor === 'PLAYER'
        ? formatClock(timeRemaining)
        : '--:--';

  const statusText =
    phase === 'finished'
      ? 'Match finished'
      : isBotThinking
        ? 'VORTEX-AI Calculating...'
        : phase === 'playing' && currentActor === 'PLAYER'
          ? 'Awaiting your move'
          : phase === 'playing'
            ? 'Opponent turn'
            : 'Preparing duel...';

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
    setValidationErrorMsg('TIME UP: a random guess was submitted for you.');
    useMatchStore.getState().clearTimeUp();
  }, [timeUp]);

  useEffect(() => {
    const list = ledgerRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [moves.length]);

  const pressKey = (num: number) => {
    if (!canPlay || currentDraft.includes(num) || currentDraft.length >= 4) return;
    soundEngine.playKeypad();
    setCurrentDraft((prev) => [...prev, num]);
    setValidationErrorMsg(null);
  };

  const handleBackspace = () => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setCurrentDraft((prev) => prev.slice(0, -1));
    setValidationErrorMsg(null);
  };

  const handleClear = () => {
    if (!canPlay) return;
    soundEngine.playKeypad();
    setCurrentDraft([]);
    setValidationErrorMsg(null);
  };

  const submitDraftGuess = () => {
    if (!canPlay) return;

    const outcome = useMatchStore.getState().submitGuess(currentDraft.join(''));
    if (!outcome.ok) {
      soundEngine.playErrorBuzz();
      setValidationErrorMsg(ERROR_MESSAGES[outcome.error]);
      return;
    }

    soundEngine.playSubmit();
    const last = useMatchStore.getState().moves.filter((move) => move.isPlayerMove).at(-1);
    if (last && last.feedback.picos > 0) soundEngine.playPicoChime();
    else if (last && last.feedback.palas > 0) soundEngine.playPalaPing();

    setCurrentDraft([]);
    setValidationErrorMsg(null);
  };

  // Physical keyboard: 1–9 digits, Backspace, Escape, Enter.
  useEffect(() => {
    if (!canPlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        pressKey(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        // Stop Enter from also "clicking" whichever button currently has focus.
        e.preventDefault();
        submitDraftGuess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, currentDraft]);

  const handleNewDuel = () => {
    if (phase === 'playing' && !confirm('Abandon the current duel and start a new one?')) return;
    useMatchStore.getState().openSetup(storeDifficulty);
    setCurrentDraft([]);
    setValidationErrorMsg(null);
    setShareCopied(false);
  };

  const handleLeave = () => {
    useMatchStore.getState().reset();
    onExitArena?.();
  };

  const handleForfeit = () => {
    if (!confirm('Are you sure you want to forfeit this duel? This counts as a defeat.')) return;
    useMatchStore.getState().reset();
    onMatchComplete?.('lose');
    onExitArena?.();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `I cracked the cipher in ${playerMoves.length} guesses on Pico & Pala!`,
      );
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  };

  if (mode !== 'ai') {
    return (
      <div className="max-w-xl w-full mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
          This mode is coming soon
        </span>
        <p className="text-sm text-[#a98891]">
          Private and global rooms need the online backend. You can play against the AI right now.
        </p>
        <button
          onClick={onExitArena}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider"
        >
          Back to Play Hub
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col select-none pb-12">
      {/* ARENA HEADER STRIP */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#a98891]">
          <span>TACTICAL 1v1 ARENA</span>
          <span>•</span>
          <span className="text-[#00d2ff] font-bold">VS AI · {difficultyMeta.label.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30]">
            <Timer className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span className="font-mono text-xs font-bold text-[#00d2ff]">
              {timerLabel}
            </span>
          </div>
          <button
            onClick={handleNewDuel}
            className="px-2.5 py-1 rounded-full bg-[#191b21] hover:bg-[#282a30] text-[#a98891] hover:text-white transition-all flex items-center gap-1"
            title="Start a new duel"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Duel</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-ZONE ARENA GRID */}
      <div className="max-w-[1400px] w-full mx-auto px-2 sm:px-4 lg:px-6 pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 relative">
        {/* ==================================================== */}
        {/* ZONE 1: LEFT RAIL (Turn Meter & Input Pad)            */}
        {/* ==================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          {/* Pacing Gauge Card */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
                Pacing Gauge
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#00d2ff]/20 text-[#00d2ff]">
                {playerAttemptsLeft} left
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Circular SVG Meter */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#282a30]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#ff479b] transition-all duration-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${(turnCount / maxTurns) * 100}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Cairo'] text-lg font-black text-white leading-none">
                    {turnCount < 10 ? `0${turnCount}` : turnCount}
                  </span>
                  <span className="text-[9px] text-[#a98891] uppercase font-bold">/ 12</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-['Cairo'] text-sm font-bold text-white">
                  Turn {turnCount < 10 ? `0${turnCount}` : turnCount} of 12
                </span>
                <span className="text-xs text-[#a98891]">
                  Turns Remaining:{' '}
                  <strong className="text-[#ff479b] font-bold">
                    {Math.max(0, maxTurns - turnCount)}
                  </strong>
                </span>
                <div className="w-full bg-[#0c0e14] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00d2ff] to-[#ff479b] transition-all duration-300"
                    style={{ width: `${(turnCount / maxTurns) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Virtual Keypad Card */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
                Tactical Keypad
              </span>
              <span className="text-xs font-bold text-[#ff479b]">1–9 ONLY</span>
            </div>

            {/* 3x3 Keypad Matrix (Zero is excluded) */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: 1, label: 'Alpha' },
                { n: 2, label: 'Beta' },
                { n: 3, label: 'Gamma' },
                { n: 4, label: 'Delta' },
                { n: 5, label: 'Epsilon' },
                { n: 6, label: 'Zeta' },
                { n: 7, label: 'Eta' },
                { n: 8, label: 'Theta' },
                { n: 9, label: 'Iota' },
              ].map((key) => {
                const isSlotted = currentDraft.includes(key.n);
                return (
                  <button
                    key={key.n}
                    onClick={() => pressKey(key.n)}
                    disabled={isSlotted || !canPlay}
                    className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSlotted
                        ? 'bg-[#282a30] opacity-40 cursor-not-allowed border border-[#33353b]'
                        : 'bg-[#111319] hover:bg-[#282a30] active:scale-95 border border-[#282a30] hover:border-[#ff479b]/60 text-white shadow-md'
                    }`}
                  >
                    <span
                      className={`font-['Cairo'] text-2xl font-black leading-none ${
                        isSlotted ? 'text-[#ff479b]' : 'text-white'
                      }`}
                    >
                      {key.n}
                    </span>
                    <span className="text-[9px] uppercase tracking-tighter leading-none mt-0.5 text-[#a98891]">
                      {isSlotted ? 'SLOTTED' : key.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Actions: Clear & Undo */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={handleClear}
                className="h-10 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#a98891]" /> CLEAR
              </button>
              <button
                onClick={handleBackspace}
                className="h-10 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Delete className="w-3.5 h-3.5 text-rose-400" /> UNDO
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0c0e14] border border-[#282a30] flex items-center gap-2">
              <span className="text-[11px] text-[#a98891] leading-tight">
                Use hardware keypad <code className="bg-[#282a30] px-1 rounded text-white font-bold">1–9</code> or tap on-screen keys.
              </span>
            </div>
          </div>

          {/* Quick Session Stats Mini */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[#a98891]">
              <span>Target Cipher Length</span>
              <span className="text-white font-bold">4 Unique Digits</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#a98891]">
              <span>Possibility Matrix</span>
              <span className="text-[#00d2ff] font-bold">3,024 Combinations</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#a98891]">
              <span>Remaining Candidates</span>
              <span className="text-[#ffe170] font-bold">{remainingCandidates.toLocaleString()} feasible</span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 2: CENTER ARENA (Board, Ledger, Guess Console)  */}
        {/* ==================================================== */}
        <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2 min-w-0">
          {/* Opponent Strip (Top Center) */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d2ff]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-[#282a30] flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6 text-[#00d2ff]" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#191b21]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-['Cairo'] font-bold text-sm text-white">VORTEX-AI</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#00d2ff]/20 text-[#00d2ff] font-black uppercase">
                      {difficultyMeta.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#a98891]">{difficultyMeta.botLine}</span>
                </div>
              </div>

              {/* Opponent Status */}
              <div className="px-3 py-1 rounded-full bg-[#111319] border border-[#282a30] flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBotThinking ? 'bg-[#ff479b] animate-ping' : 'bg-[#00d2ff] animate-pulse'
                  }`}
                />
                <span className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider">
                  {statusText}
                </span>
              </div>
            </div>

            {/* Opponent Locked Mystery Slots */}
            <div className="flex items-center justify-between bg-[#0c0e14] border border-[#282a30] rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#a98891]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
                  Opponent Cipher Locked
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="w-8 h-10 rounded-lg bg-[#282a30] border border-white/5 flex items-center justify-center font-['Cairo'] font-black text-sm text-[#a98891]"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player's Secret Cipher Strip */}
          <div className="bg-gradient-to-r from-[#e9c400]/15 via-[#191b21] to-[#191b21] border border-[#e9c400]/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-[#e9c400] rounded-full shadow-[0_0_12px_rgba(255,214,0,0.6)]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Cairo'] font-black text-sm text-[#ffe170] uppercase tracking-wider">
                    Your Secret Cipher
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#e9c400]/20 text-[#ffe170] font-bold uppercase flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Hidden from Rival
                  </span>
                </div>
                <span className="text-xs text-[#a98891]">
                  If opponent deduces this exact sequence, you lose.
                </span>
              </div>
            </div>

            {/* Glowing secret digits */}
            <div className="flex items-center gap-2">
              {playerSecret.map((digit, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded-xl bg-[#282a30] border border-white/10 flex items-center justify-center shadow-inner"
                >
                  <span className="font-['Cairo'] text-2xl font-black text-[#ffe170] leading-none">
                    {digit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deduction Ledger (Scrollable History Stream) */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-2 flex-1 min-h-[300px] max-h-[440px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#282a30]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a98891] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#ff479b]" /> Tactical Deduction Ledger
              </span>
              <span className="text-xs text-[#a98891]">
                {ledger.length} Turns Recorded
              </span>
            </div>

            {/* Ledger List */}
            <div ref={ledgerRef} className="flex flex-col gap-2 overflow-y-auto pr-1">
              {ledger.map((rec) => (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    rec.actor === 'YOU'
                      ? 'bg-[#111319] border-[#282a30] hover:border-[#ff479b]/40'
                      : 'bg-[#282a30]/50 border-transparent hover:bg-[#282a30]'
                  }`}
                >
                  {/* Left: Actor tag & 4 guess digits */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold w-16 font-['Cairo'] ${
                        rec.actor === 'YOU' ? 'text-[#ff479b]' : 'text-[#00d2ff]'
                      }`}
                    >
                      T{String(rec.turnNumber).padStart(2, '0')} · {rec.actor}
                    </span>

                    <div className="flex items-center gap-1">
                      {rec.guess.map((d, i) => (
                        <span
                          key={i}
                          className="w-7 h-7 rounded-lg bg-[#0c0e14] border border-white/5 flex items-center justify-center font-['Cairo'] font-black text-sm text-white"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Pico/Pala Clue Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {/* Picos */}
                      {Array.from({ length: rec.picos }).map((_, i) => (
                        <span
                          key={`pico-${i}`}
                          className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.8)]"
                          title="Pico"
                        />
                      ))}
                      {/* Palas */}
                      {Array.from({ length: rec.palas }).map((_, i) => (
                        <span
                          key={`pala-${i}`}
                          className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.7)]"
                          title="Pala"
                        />
                      ))}
                      {/* Misses */}
                      {Array.from({ length: rec.misses }).map((_, i) => (
                        <span
                          key={`miss-${i}`}
                          className="w-2.5 h-2.5 rounded-full bg-[#33353b]"
                          title="Miss"
                        />
                      ))}
                    </div>

                    <span className="text-xs font-bold text-[#e2bdc7] min-w-[70px] text-right font-['Cairo']">
                      {rec.picos > 0 && `${rec.picos}P `}
                      {rec.palas > 0 && `${rec.palas}L `}
                      {rec.picos === 0 && rec.palas === 0 && '0 Matches'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Docked Current Guess Input Console */}
          <div className="bg-[#191b21] border border-[#ff479b]/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-['Cairo'] font-bold text-sm text-[#ff479b] uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Draft Your Turn {turnCount < 10 ? `0${turnCount}` : turnCount} Guess
              </span>
              <span
                className={`text-xs font-medium ${
                  validationErrorMsg ? 'text-rose-400 font-bold' : 'text-[#a98891]'
                }`}
              >
                {validationErrorMsg ||
                  `Digits 1–9 only · No repeats · ${Math.max(0, 4 - currentDraft.length)} remaining`}
              </span>
            </div>

            {/* 4 Large Active Digit Slots */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 my-1">
              {[0, 1, 2, 3].map((slotIdx) => {
                const isFilled = slotIdx < currentDraft.length;
                const isActive = slotIdx === currentDraft.length;
                const digit = isFilled ? currentDraft[slotIdx] : null;

                return (
                  <div
                    key={slotIdx}
                    className={`h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isFilled
                        ? 'bg-[#282a30] border-2 border-[#ff479b] shadow-[0_0_15px_rgba(255,71,155,0.3)]'
                        : isActive
                        ? 'bg-[#0c0e14] border-2 border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.4)] animate-pulse'
                        : 'bg-[#0c0e14] border border-[#282a30] opacity-50'
                    }`}
                  >
                    <span
                      className={`font-['Cairo'] text-3xl sm:text-4xl font-black leading-none ${
                        isFilled
                          ? 'text-white'
                          : isActive
                          ? 'text-[#00d2ff]'
                          : 'text-[#a98891]/40'
                      }`}
                    >
                      {isFilled ? digit : isActive ? '_' : '·'}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-1 ${
                        isFilled
                          ? 'text-[#ffb0ca]'
                          : isActive
                          ? 'text-[#00d2ff]'
                          : 'text-[#a98891]/40'
                      }`}
                    >
                      {isActive ? 'READY' : `POS ${slotIdx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Submission Triggers */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="h-12 px-4 rounded-xl bg-[#282a30] hover:bg-[#33353b] active:scale-95 text-white font-bold transition-all flex items-center justify-center"
                title="Clear Draft"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={submitDraftGuess}
                disabled={currentDraft.length < 4 || !canPlay}
                className={`flex-1 h-12 rounded-xl text-white font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                  currentDraft.length === 4
                    ? 'bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#00d2ff] shadow-[0_0_24px_rgba(255,46,149,0.5)] cursor-pointer hover:brightness-110'
                    : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
                }`}
              >
                <span>LOCK & SUBMIT CIPHER</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ZONE 3: RIGHT RAIL (Timeline, Match Intel, Lexicon)  */}
        {/* ==================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3">
          {/* Turn Flow Sequence */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
                Turn Flow Sequence
              </span>
              <span className="text-xs font-bold text-[#00d2ff]">Round {turnCount}/{maxTurns}</span>
            </div>

            <div className="flex flex-col gap-2 relative pl-3">
              {/* Vertical timeline line */}
              <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-[#282a30]" />

              {timelineSteps.map((step) => {
                const isPast = step <= moves.length;
                const isActive = phase === 'playing' && step === moves.length + 1;
                const isBot = (step % 2 === 1) === (starter === 'AI');

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 relative z-10 ${
                      isActive ? 'bg-[#ff479b]/10 p-1.5 -ml-1 rounded-xl' : ''
                    } ${!isPast && !isActive ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#ff479b] text-white shadow-[0_0_8px_rgba(255,46,149,0.8)]'
                          : isPast
                          ? 'bg-[#282a30] text-[#00d2ff]'
                          : 'bg-[#282a30] text-[#a98891]'
                      }`}
                    >
                      {step}
                    </span>
                    <span
                      className={`text-xs ${
                        isActive
                          ? "font-['Cairo'] font-bold text-[#ff479b]"
                          : "text-[#e2e2ea]"
                      }`}
                    >
                      Turn {step} · {isBot ? 'Bot' : 'You'} {isActive && '(ACTIVE)'}
                    </span>
                    {isPast && <Check className="w-3 h-3 text-[#00d2ff] ml-auto" />}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#ff479b] animate-ping ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Match Intel Mini */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
              Tactical Match Intel
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                <span className="text-[11px] text-[#a98891]">Your Picos</span>
                <span className="font-['Cairo'] text-sm font-black text-[#ffe170]">
                  {totalPicos}
                </span>
              </div>
              <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                <span className="text-[11px] text-[#a98891]">Your Palas</span>
                <span className="font-['Cairo'] text-sm font-black text-[#00d2ff]">
                  {totalPalas}
                </span>
              </div>
              <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                <span className="text-[11px] text-[#a98891]">Guesses Left</span>
                <span className="font-['Cairo'] text-sm font-black text-white">{playerAttemptsLeft} / {maxTurns}</span>
              </div>
              <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                <span className="text-[11px] text-[#a98891]">Bot Guesses Left</span>
                <span className="font-['Cairo'] text-sm font-black text-[#ffb0ca]">{aiAttemptsLeft} / {maxTurns}</span>
              </div>
            </div>
          </div>

          {/* Rule Lexicon */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
              Rule Lexicon
            </span>
            <div className="flex items-start gap-2.5">
              <span className="w-3.5 h-3.5 mt-0.5 rounded-full bg-[#e9c400] shrink-0 shadow-[0_0_8px_rgba(255,214,0,0.6)]" />
              <div className="flex flex-col">
                <span className="font-['Cairo'] text-xs font-bold text-[#ffe170]">
                  PICO (Bullseye)
                </span>
                <span className="text-[11px] text-[#a98891]">
                  Digit exists & occupies exact position.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-3.5 h-3.5 mt-0.5 rounded-full border-2 border-[#ff479b] bg-transparent shrink-0 shadow-[0_0_8px_rgba(255,46,149,0.5)]" />
              <div className="flex flex-col">
                <span className="font-['Cairo'] text-xs font-bold text-[#ff479b]">
                  PALA (Match)
                </span>
                <span className="text-[11px] text-[#a98891]">
                  Digit exists in cipher, but wrong slot.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-3 h-3 mt-0.5 rounded-full bg-[#33353b] shrink-0" />
              <div className="flex flex-col">
                <span className="font-['Cairo'] text-xs font-bold text-[#a98891]">
                  MISS (Zero)
                </span>
                <span className="text-[11px] text-[#a98891]">
                  Digit does not appear anywhere in code.
                </span>
              </div>
            </div>
          </div>

          {/* Forfeit button */}
          <button
            onClick={handleForfeit}
            className="w-full py-2 rounded-xl text-[#a98891] hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Flag className="w-4 h-4" /> Forfeit Current Match
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODALS & OVERLAYS                                     */}
      {/* ==================================================== */}

      {/* Modal 0: Choose your secret cipher */}
      {phase === 'setup' && (
        <SecretSetupModal
          difficultyLabel={difficultyMeta.label}
          onLock={(secret) => {
            soundEngine.playSubmit();
            useMatchStore.getState().lockSecret(secret);
          }}
          onCancel={handleLeave}
        />
      )}

      {/* Modal 1: Coin Toss (Start) */}
      {phase === 'toss' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.4)] animate-bounce">
              <Flame className="w-10 h-10 text-[#ffe170]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
                Deciding Initiative
              </span>
              <span className="text-sm text-[#a98891]">
                {starter === 'PLAYER'
                  ? 'Coin flip complete: You won the toss and will shoot first!'
                  : 'Coin flip complete: VORTEX-AI won the toss and will shoot first.'}
              </span>
            </div>
            <div className="w-full py-3 bg-[#111319] rounded-2xl flex items-center justify-around text-xs font-bold">
              <span className="text-[#ff479b]">
                YOUR MOVE: {starter === 'PLAYER' ? 'FIRST' : 'SECOND'}
              </span>
              <span className="text-[#33353b]">|</span>
              <span className="text-[#00d2ff]">
                AI BOT: {starter === 'PLAYER' ? 'SECOND' : 'FIRST'}
              </span>
            </div>
            <button
              onClick={() => useMatchStore.getState().beginPlay()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Enter Duel Grid
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Result (victory / defeat / draw) */}
      {phase === 'finished' && result && (() => {
        const theme = RESULT_THEME[result];
        const ResultIcon = theme.Icon;
        const botGuesses = moves.length - playerMoves.length;
        const summary =
          result === 'win'
            ? `Deduction achieved in ${playerMoves.length} guesses. Opponent code decrypted.`
            : result === 'lose'
              ? `VORTEX-AI cracked your code in ${botGuesses} guesses.`
              : 'Both sides ran out of guesses. Nobody cracked the cipher.';

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div
              className={`max-w-lg w-full bg-[#191b21] border ${theme.border} rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden animate-in fade-in zoom-in-95`}
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
                  {theme.badgeText}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-['Cairo'] text-3xl font-black text-white uppercase tracking-tight">
                  {theme.title}
                </span>
                <span className="text-sm text-[#e2bdc7]">{summary}</span>
              </div>

              <div className="w-full p-4 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">
                  {result === 'win' ? 'Opponent Secret Decrypted' : 'Opponent Secret Was'}
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
                  <span className="text-[11px] text-[#a98891]">Your Guesses</span>
                  <span className="font-['Cairo'] text-base font-bold text-white">
                    {playerMoves.length} / {maxTurns}
                  </span>
                </div>
                <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-[#a98891]">Bot Guesses</span>
                  <span className="font-['Cairo'] text-base font-bold text-[#00d2ff]">
                    {botGuesses} / {maxTurns}
                  </span>
                </div>
                <div className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
                  <span className="text-[11px] text-[#a98891]">Picos / Palas</span>
                  <span className="font-['Cairo'] text-base font-bold text-[#ffe170]">
                    {totalPicos} / {totalPalas}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={handleNewDuel}
                  className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Play Next Duel
                </button>
                {result === 'win' && (
                  <button
                    onClick={handleShare}
                    className="w-full sm:w-auto px-5 h-12 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> {shareCopied ? 'Copied!' : 'Share'}
                  </button>
                )}
                <button
                  onClick={handleLeave}
                  className="w-full sm:w-auto px-5 h-12 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Play Hub
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

interface SecretSetupModalProps {
  difficultyLabel: string;
  onLock: (secret: string) => void;
  onCancel: () => void;
}

const SecretSetupModal: React.FC<SecretSetupModalProps> = ({ difficultyLabel, onLock, onCancel }) => {
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.3)]">
          <Lock className="w-8 h-8 text-[#ffe170]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Cairo'] text-2xl font-black uppercase text-white">
            Choose Your Secret Cipher
          </span>
          <span className="text-sm text-[#a98891]">
            4 unique digits from 1 to 9. VORTEX-AI ({difficultyLabel}) will try to crack it.
          </span>
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
            <Delete className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={() => setDraft(generateSecretNumber().split('').map(Number))}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#e2e2ea] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" /> Random
          </button>
          <button
            onClick={onCancel}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#a98891] text-xs font-bold uppercase tracking-wider"
          >
            Cancel
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
          Lock Secret
        </button>
      </div>
    </div>
  );
};
