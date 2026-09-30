'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Play,
  Share2,
  Copy,
  Check,
  Bot,
  Key,
  Globe,
  Radar,
  User,
  Swords,
  Timer,
  Award,
  AlertCircle,
  Sparkles,
  Flame,
  Shield,
} from 'lucide-react';
import { Difficulty, GameMode } from '@/types/game';

interface PlayHubViewProps {
  onStartMatch: (mode: GameMode, difficulty?: Difficulty) => void;
  onResumeMatch?: () => void;
  hasActiveMatch?: boolean;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  onStartMatch,
  onResumeMatch,
  hasActiveMatch = false,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('grandmaster');
  const [hostRoomCode, setHostRoomCode] = useState('AB7X2Q');
  const [copied, setCopied] = useState(false);
  const [passcodeSlots, setPasscodeSlots] = useState(['K', '9', 'Z', '', '', '']);
  const [passcodeError, setPasscodeError] = useState(true);
  const [isRechecking, setIsRechecking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'standard' | 'ranked' | 'scrims'>('standard');

  const copyRoomCode = () => {
    navigator.clipboard.writeText(hostRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recheckStatus = () => {
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-8">
      {/* 1. TOP OFFLINE STATUS NOTICE STRIP */}
      <div className="w-full rounded-2xl bg-[#e9c400]/15 border border-[#e9c400]/30 px-4 sm:px-6 py-3 backdrop-blur-md transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[#ffe170]">
          <div className="flex items-center gap-3 text-sm">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e9c400] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e9c400]" />
            </span>
            <span className="font-bold tracking-wide">⚡ You're in offline-ready node</span>
            <span className="hidden sm:inline text-[#e2bdc7] text-xs">
              — Versus AI operates 100% client-side with zero latency. Global & Private rooms simulate real matchmaking.
            </span>
          </div>
          <button
            onClick={recheckStatus}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffe170] hover:text-white uppercase tracking-wider transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>Recheck Status</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE MATCH RESUME ALERT CARD (Optional session resume) */}
      <div className="relative w-full rounded-2xl bg-[#1d1f26] border border-[#282a30] border-l-4 border-l-[#e9c400] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e9c400]/10 via-transparent to-[#ff479b]/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#e9c400]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(233,196,0,0.3)]">
              <Swords className="w-6 h-6 text-[#ffe170]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#e9c400] text-black font-['Cairo'] text-[11px] font-black uppercase tracking-wider">
                  SESSION ACTIVE
                </span>
                <span className="text-xs text-[#a98891]">Round Phase #02</span>
              </div>
              <h3 className="font-['Cairo'] text-white text-lg md:text-xl font-bold tracking-tight mt-0.5">
                Turn <span className="text-[#ffe170] font-black">7 / 12</span> vs Bot (Grandmaster)
              </h3>
              <p className="text-xs text-[#a98891]">
                Target cipher: 4 distinct digits locked. Deductive ledger synced.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <button
              onClick={() => onStartMatch('ai', 'grandmaster')}
              className="px-4 py-2.5 rounded-full font-bold text-[#e2bdc7] hover:text-white hover:bg-[#282a30] transition-all text-xs tracking-wider uppercase"
            >
              Reset Match
            </button>
            <button
              onClick={() => (onResumeMatch ? onResumeMatch() : onStartMatch('ai', selectedDifficulty))}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff479b] via-[#ff2e95] to-[#b90067] text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Resume Match</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PAGE HEADER & CATEGORY TABS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30] text-xs font-bold text-[#a5e7ff] uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
            <span>Tactical Operations Deck</span>
          </div>
          <h1 className="font-['Cairo'] text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Choose Your Battle
          </h1>
          <p className="text-[#e2e2ea]/80 text-sm sm:text-base max-w-2xl mt-1">
            Step into the deduction arena. Select your mode, lock in your cipher, and decipher your rival's hidden code through pure deduction logic.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#0c0e14] rounded-full border border-[#282a30] self-start lg:self-auto">
          <button
            onClick={() => setActiveCategory('standard')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-wide transition-all ${
              activeCategory === 'standard'
                ? 'bg-[#282a30] text-[#ffb0ca] shadow-[0_0_12px_rgba(255,176,202,0.2)]'
                : 'text-[#e2bdc7] hover:text-white'
            }`}
          >
            Standard Play
          </button>
          <button
            onClick={() => setActiveCategory('ranked')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-wide transition-all ${
              activeCategory === 'ranked'
                ? 'bg-[#282a30] text-[#ffb0ca] shadow-[0_0_12px_rgba(255,176,202,0.2)]'
                : 'text-[#e2bdc7] hover:text-white'
            }`}
          >
            Ranked S1
          </button>
          <button
            onClick={() => setActiveCategory('scrims')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-wide transition-all ${
              activeCategory === 'scrims'
                ? 'bg-[#282a30] text-[#ffb0ca] shadow-[0_0_12px_rgba(255,176,202,0.2)]'
                : 'text-[#e2bdc7] hover:text-white'
            }`}
          >
            Custom Scrims
          </button>
        </div>
      </div>

      {/* 4. MODES GRID (Versus AI + Private Room) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MODE 1: VERSUS AI (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#191b21] border border-[#282a30] p-5 sm:p-6 shadow-2xl relative overflow-hidden group">
          {/* Top Neon Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-[#00d2ff] to-[#a5e7ff]" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)] shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Cairo'] text-2xl font-black text-white tracking-tight">
                    Versus AI
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-[11px] font-bold uppercase tracking-wider">
                    Zero Latency
                  </span>
                </div>
                <p className="text-xs text-[#a98891] mt-0.5">
                  Challenge our tactical cipher engine. Works offline with instantaneous round turns.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Offline Ready
            </span>
          </div>

          {/* Difficulty Matrix */}
          <div className="my-2 flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest text-[#a98891] font-bold">
              Target Difficulty Matrix
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Novice */}
              <button
                onClick={() => setSelectedDifficulty('novice')}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                  selectedDifficulty === 'novice'
                    ? 'bg-[#282a30] border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                    : 'bg-[#111319] border-[#282a30] hover:bg-[#1d1f26]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold">Lvl 01</span>
                  </div>
                  <h4 className="font-['Cairo'] text-white text-sm font-bold">Novice</h4>
                  <p className="text-[11px] text-[#a98891] leading-tight mt-1">
                    Basic elimination logic. Forgiving timer constraints.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                  12 Guesses Allotted
                </div>
              </button>

              {/* Tactician */}
              <button
                onClick={() => setSelectedDifficulty('tactician')}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                  selectedDifficulty === 'tactician'
                    ? 'bg-[#282a30] border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.3)] ring-1 ring-[#00d2ff]'
                    : 'bg-[#111319] border-[#282a30] hover:bg-[#1d1f26]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[#00d2ff] mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold">Lvl 02</span>
                  </div>
                  <h4 className="font-['Cairo'] text-white text-sm font-bold">Tactician</h4>
                  <p className="text-[11px] text-[#a98891] leading-tight mt-1">
                    Aggressive branch pruning. Detects digit collisions fast.
                  </p>
                </div>
                <div className="text-[10px] text-[#00d2ff] uppercase font-semibold">
                  10 Guesses Allotted
                </div>
              </button>

              {/* Grandmaster */}
              <button
                onClick={() => setSelectedDifficulty('grandmaster')}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-36 relative overflow-hidden ${
                  selectedDifficulty === 'grandmaster'
                    ? 'bg-[#282a30] border-[#ff479b] shadow-[0_0_20px_rgba(255,71,155,0.3)] ring-2 ring-[#ff479b]'
                    : 'bg-[#111319] border-[#282a30] hover:bg-[#1d1f26]'
                }`}
              >
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#ff479b]/20 rounded-full blur-md" />
                <div>
                  <div className="flex items-center justify-between text-[#ff479b] mb-1">
                    <Flame className="w-4 h-4 fill-[#ff479b]" />
                    <span className="text-[10px] uppercase font-bold text-[#ffb0ca]">
                      {selectedDifficulty === 'grandmaster' ? 'Selected' : 'Lvl 03'}
                    </span>
                  </div>
                  <h4 className="font-['Cairo'] text-white text-sm font-black">Grandmaster</h4>
                  <p className="text-[11px] text-[#e2bdc7] leading-tight mt-1">
                    Near-optimal tree pruning. Zero wasted queries. Maximum pressure.
                  </p>
                </div>
                <div className="text-[10px] text-[#ffb0ca] uppercase font-black tracking-wider">
                  8 Guesses Allotted
                </div>
              </button>
            </div>
          </div>

          {/* Launch Controls */}
          <div className="mt-5 pt-4 border-t border-[#282a30] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-[#a98891]">
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-[#ffe170]" />
                <span>45s / turn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#00d2ff]" />
                <span>4 Digits (1–9)</span>
              </div>
            </div>

            <button
              onClick={() => onStartMatch('ai', selectedDifficulty)}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 via-[#ff479b] to-[#00d2ff] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:shadow-[0_0_35px_rgba(0,210,255,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Engage Bot ({selectedDifficulty.toUpperCase()})</span>
            </button>
          </div>
        </div>

        {/* MODE 2: PRIVATE DUEL (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl bg-[#191b21] border border-[#282a30] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff479b] via-[#ff2e95] to-orange-500" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff479b]/20 to-orange-500/20 flex items-center justify-center text-[#ffb0ca] shadow-[0_0_20px_rgba(255,46,149,0.3)] shrink-0">
                <Key className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Cairo'] text-2xl font-black text-white tracking-tight">
                    Private Duel
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff479b]/20 text-[#ffb0ca] text-[11px] font-bold uppercase tracking-wider">
                    Direct 1v1
                  </span>
                </div>
                <p className="text-xs text-[#a98891] mt-0.5">
                  Host a private battle room or join via 6-digit match key.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Host Secure Room */}
            <div className="p-4 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a98891] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff479b]" /> Host Secure Room
                </span>
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Waiting: 0/1 Rival
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#0c0e14] p-3 rounded-xl border border-[#282a30]">
                <div className="flex items-center gap-1.5 font-['Cairo'] font-black text-lg text-white tracking-widest">
                  {hostRoomCode.split('').map((ch, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#282a30] rounded-lg shadow-inner text-[#ffe170]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyRoomCode}
                    className="p-2 rounded-lg bg-[#282a30] hover:bg-[#33353b] text-white hover:text-[#00d2ff] transition-all"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Pico & Pala 1v1 Room', text: `Join my Pico & Pala battle with code: ${hostRoomCode}` });
                      } else {
                        copyRoomCode();
                      }
                    }}
                    className="p-2 rounded-lg bg-[#282a30] hover:bg-[#33353b] text-white hover:text-[#ff479b] transition-all"
                    title="Share Room"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Join Room */}
            <div className="p-4 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a98891] flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#00d2ff]" /> Enter Rival's Passcode
              </span>

              <div className="grid grid-cols-6 gap-1.5 text-center font-['Cairo'] font-black">
                {passcodeSlots.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => {
                      const next = [...passcodeSlots];
                      next[idx] = e.target.value.toUpperCase();
                      setPasscodeSlots(next);
                      if (next.join('').length === 6) {
                        setPasscodeError(false);
                      }
                    }}
                    className={`w-full h-11 bg-[#0c0e14] text-white text-center rounded-lg text-lg focus:outline-none transition-all ${
                      idx === 3 && val === ''
                        ? 'border-2 border-[#ff479b] shadow-[0_0_12px_rgba(255,46,149,0.5)] animate-pulse'
                        : 'border border-[#282a30]'
                    }`}
                  />
                ))}
              </div>

              {passcodeError && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 text-xs border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Room not found — verify code or ask host to re-issue session.</span>
                </div>
              )}

              <button
                onClick={() => {
                  setPasscodeSlots(['A', 'B', '7', 'X', '2', 'Q']);
                  setPasscodeError(false);
                  onStartMatch('private');
                }}
                className="w-full py-2.5 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Connect to Lobby
              </button>
            </div>
          </div>
        </div>

        {/* MODE 3: GLOBAL RANKED ARENA (12 Cols Full Width) */}
        <div className="lg:col-span-12 rounded-3xl bg-[#191b21] border border-[#282a30] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d2ff] via-teal-400 to-[#e9c400]" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d2ff]/20 to-teal-500/20 flex items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)] shrink-0">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Cairo'] text-2xl font-black text-white tracking-tight">
                    Global Ranked Arena
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    Verified Anti-Cheat
                  </span>
                </div>
                <p className="text-xs text-[#a98891] mt-0.5">
                  Compete on the global ladder. Real-time synchronous duel deduction with competitive ELO rating stakes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto bg-[#111319] border border-[#282a30] px-4 py-2 rounded-2xl">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#a98891] uppercase tracking-wider font-bold">
                  Your Bracket
                </span>
                <span className="font-['Cairo'] text-sm text-[#00d2ff] font-black">
                  Diamond Tier · 1,420 ELO
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
                <Award className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Matchmaking Dual Panels: Radar vs Clash Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Active Radar Telemetry */}
            <div className="lg:col-span-5 rounded-2xl bg-[#111319] border border-[#282a30] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a98891] flex items-center gap-1.5">
                  <Radar className="w-4 h-4 text-[#00d2ff]" /> Active Radar Telemetry
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-[10px] uppercase font-black">
                  Searching
                </span>
              </div>

              {/* Concentric Radar Graphic */}
              <div className="relative w-full h-44 flex items-center justify-center overflow-hidden my-2">
                <div className="absolute w-40 h-40 rounded-full border border-[#00d2ff]/20" />
                <div className="absolute w-28 h-28 rounded-full border border-[#00d2ff]/30" />
                <div className="absolute w-14 h-14 rounded-full border border-[#00d2ff]/50" />
                <div className="w-3 h-3 rounded-full bg-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.9)] animate-ping" />

                {/* Animated Rotating Sweep Line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="w-1/2 h-[2px] bg-gradient-to-r from-transparent to-[#00d2ff] origin-left animate-spin"
                    style={{ animationDuration: '4s' }}
                  />
                </div>

                {/* Ghost candidate dots */}
                <div className="absolute top-8 left-16 w-2 h-2 rounded-full bg-[#ff479b] animate-pulse" />
                <div className="absolute bottom-10 right-20 w-2 h-2 rounded-full bg-[#e9c400] animate-ping" />
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[#0c0e14] p-2.5 rounded-xl border border-[#282a30]">
                <div>
                  <span className="block text-[10px] uppercase text-[#a98891] font-bold">Queue Pos</span>
                  <span className="font-['Cairo'] text-xs text-white font-black">#4 in pool</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-[#a98891] font-bold">Est. Wait</span>
                  <span className="font-['Cairo'] text-xs text-[#00d2ff] font-black">~18 sec</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-[#a98891] font-bold">Region</span>
                  <span className="font-['Cairo'] text-xs text-white font-black">NA-East (Auto)</span>
                </div>
              </div>

              <button
                onClick={() => onStartMatch('global')}
                className="w-full mt-3 py-2 rounded-xl bg-[#1d1f26] hover:bg-[#282a30] text-[#e2bdc7] hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Instant Match Test
              </button>
            </div>

            {/* Right: MATCH CONFIRMED CLASH BANNER */}
            <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#111319] via-[#1d1f26] to-[#282a30] border border-[#00d2ff]/30 p-5 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#00d2ff]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#ff479b]/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/20 text-[#a5e7ff] text-xs font-bold uppercase tracking-widest">
                    <Check className="w-3.5 h-3.5 text-[#00d2ff]" />
                    Match Confirmed! Synchronizing
                  </div>
                  <div className="font-['Cairo'] text-[#ff479b] text-xs font-black uppercase tracking-wider animate-pulse">
                    Deploying in 03s
                  </div>
                </div>

                {/* VS Clash Composition */}
                <div className="flex items-center justify-between gap-3 my-4">
                  {/* Local Player */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_16px_rgba(0,210,255,0.4)]">
                        <div className="w-full h-full rounded-full bg-[#111319] flex items-center justify-center text-[#00d2ff]">
                          <User className="w-6 h-6" />
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#0c0e14] text-[9px] font-black text-[#00d2ff] rounded border border-[#282a30]">
                        P1
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Cairo'] text-white text-base font-black leading-tight">
                        You
                      </span>
                      <span className="text-xs text-[#00d2ff] font-bold">1,420 ELO</span>
                      <span className="text-[10px] text-[#a98891]">Win Rate: 64%</span>
                    </div>
                  </div>

                  {/* Center VS */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-['Cairo'] text-3xl sm:text-4xl font-black italic bg-gradient-to-b from-white via-[#ff479b] to-[#b90067] bg-clip-text text-transparent tracking-tighter drop-shadow-[0_0_12px_rgba(255,46,149,0.8)]">
                      VS
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a98891]">
                      Cipher Duel
                    </span>
                  </div>

                  {/* Rival Player */}
                  <div className="flex items-center gap-3 flex-row-reverse text-right">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-[#ff479b] p-0.5 shadow-[0_0_16px_rgba(255,46,149,0.4)]">
                        <div className="w-full h-full rounded-full bg-[#111319] flex items-center justify-center text-[#ff479b]">
                          <Swords className="w-6 h-6" />
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -left-1 px-1.5 py-0.2 bg-[#0c0e14] text-[9px] font-black text-[#ff479b] rounded border border-[#282a30]">
                        P2
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Cairo'] text-white text-base font-black leading-tight">
                        CipherKOBE
                      </span>
                      <span className="text-xs text-[#ffb0ca] font-bold">1,465 ELO</span>
                      <span className="text-[10px] text-[#a98891]">Streak: 4 Wins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress and Enter CTA */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="w-full bg-[#0c0e14] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00d2ff] via-[#ff479b] to-[#ffe170] h-full w-3/4 animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#a98891]">All players connected and ready</span>
                  <button
                    onClick={() => onStartMatch('global')}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00d2ff] via-teal-400 to-emerald-400 text-black font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Swords className="w-4 h-4 text-black" />
                    <span>Enter Match Arena</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GUEST NOTICE FOOTNOTE */}
      <div className="w-full rounded-2xl bg-[#191b21] border border-[#282a30] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#282a30] flex items-center justify-center text-[#a98891] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-[#e2bdc7]">
            Playing as <strong className="text-white">Guest Duelist</strong>. Your win logs and local deductor cache are stored locally in this browser.{' '}
            <span className="text-[#ff479b] font-bold underline cursor-pointer hover:text-white transition-colors">
              Sign in or Create Free Account
            </span>{' '}
            to back up stats and claim seasonal avatar ribbons.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#a98891]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Game Engine v2.4 Active</span>
        </div>
      </div>
    </div>
  );
};
