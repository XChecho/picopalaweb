'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Ban,
  Lock,
  Timer,
  Coins,
  Brain,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Bot,
  Key,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { AppView } from '@/types/game';

interface HowToPlayViewProps {
  onNavigate: (view: AppView) => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onNavigate }) => {
  const [tutorialMode, setTutorialMode] = useState<'easy' | 'advanced'>('easy');

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-10">
      {/* 1. HERO STRIP */}
      <div className="relative flex flex-col items-center text-center gap-3 pt-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-44 bg-[#ff479b]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#191b21] border border-[#282a30]">
          <span className="w-2 h-2 rounded-full bg-[#ff479b] animate-pulse" />
          <span className="text-xs font-black text-[#ffb0ca] uppercase tracking-widest">
            Tactical Rulebook & Tutorial
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-['Cairo'] text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
          How to Play
        </h1>
        <p className="text-base text-[#e2bdc7] max-w-xl">
          Three minutes to learn. A lifetime of bragging rights. Master the mental battlefield of binary deduction and cipher breaking.
        </p>

        {/* Mode Toggle Switch */}
        <div className="mt-4 p-1 bg-[#191b21] border border-[#282a30] rounded-full flex items-center shadow-lg">
          <button
            onClick={() => setTutorialMode('easy')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              tutorialMode === 'easy'
                ? 'bg-gradient-to-r from-[#ff5959] to-[#ff479b] text-white shadow-[0_0_20px_rgba(255,46,149,0.4)]'
                : 'text-[#a98891] hover:text-white'
            }`}
          >
            Easy Example
          </button>
          <button
            onClick={() => setTutorialMode('advanced')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              tutorialMode === 'advanced'
                ? 'bg-gradient-to-r from-[#00d2ff] to-[#47d6ff] text-black shadow-[0_0_20px_rgba(0,210,255,0.4)]'
                : 'text-[#a98891] hover:text-white'
            }`}
          >
            Advanced Strategy
          </button>
        </div>

        {/* Advanced Mode Alert */}
        {tutorialMode === 'advanced' && (
          <div className="w-full max-w-2xl mt-3 p-4 rounded-2xl bg-[#191b21] border border-[#00d2ff]/40 shadow-md text-left flex items-start gap-3 animate-in fade-in">
            <Brain className="w-6 h-6 text-[#00d2ff] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-[#00d2ff] uppercase tracking-wider block">
                Advanced Elimination Logic Activated
              </span>
              <p className="text-xs text-[#a98891] mt-0.5 leading-relaxed">
                Showing conditional probability trees, permutation math, and strict turn-burn reduction matrices throughout this breakdown.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. CORE RULE CARDS (2-Column Asymmetric Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: The Secret Number (7 cols) */}
        <div className="md:col-span-7 bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e9c400]" />
                <h2 className="font-['Cairo'] text-xl sm:text-2xl font-black text-white uppercase">
                  The Secret Number
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#282a30] text-xs font-bold text-[#a98891]">
                Step 01
              </span>
            </div>

            <p className="text-sm text-[#e2bdc7] leading-relaxed">
              Each duelist locks in an undisclosed 4-digit code. Every code must adhere to strict mathematical validity constraints:
            </p>

            {/* 4 Digit Display */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[3, 7, 1, 9].map((digit, i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col items-center justify-center shadow-inner relative"
                >
                  <span className="font-['Cairo'] text-3xl sm:text-4xl font-black text-[#ffe170]">
                    {digit}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e9c400]/60 mt-1" />
                </div>
              ))}
            </div>

            {/* Validity Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#111319] border border-[#282a30] p-3 rounded-xl flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Digits 1 to 9</span>
                  <span className="text-[10px] text-[#a98891]">Zero is illegal</span>
                </div>
              </div>

              <div className="bg-[#111319] border border-[#282a30] p-3 rounded-xl flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">No Zeros [ 0 ]</span>
                  <span className="text-[10px] text-[#a98891]">Omitted from deck</span>
                </div>
              </div>

              <div className="bg-[#111319] border border-[#282a30] p-3 rounded-xl flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Ban className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">No Duplicates</span>
                  <span className="text-[10px] text-[#a98891] line-through">[ 3 3 1 9 ] Invalid</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#282a30] flex items-center gap-2 text-xs text-[#a98891]">
            <Lock className="w-4 h-4 text-[#ff479b]" />
            <span>4 unique digits kept strictly hidden inside an encrypted vault.</span>
          </div>
        </div>

        {/* Right Column Stack: Guess Protocol (5 cols) & Who Starts */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Card 2: The Guess Protocol */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00d2ff]" />
                  <h2 className="font-['Cairo'] text-xl font-black text-white uppercase">
                    The Guess Protocol
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#282a30] text-xs font-bold text-[#a98891]">
                  Step 02
                </span>
              </div>

              <p className="text-sm text-[#e2bdc7] leading-relaxed">
                Every round, transmit 4 non-repeating digits. You receive instantaneous positional telemetry.
              </p>

              <div className="flex items-center justify-center gap-2 py-2">
                {[4, 9, 1, 7].map((d, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-xl bg-[#111319] border border-[#282a30] flex items-center justify-center font-['Cairo'] text-xl font-black text-white"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-[#111319] border border-[#282a30] p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Timer className="w-4 h-4 text-[#00d2ff]" />
                  <span>Max 12 Guesses</span>
                </div>
                <span className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider">
                  Turn Cap
                </span>
              </div>
            </div>

            <p className="text-xs text-[#a98891] mt-4">
              Repeat guesses are prohibited by UI. Every probe burns one turn token.
            </p>
          </div>

          {/* Card 3: Who Starts? */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#282a30] flex items-center justify-center shrink-0">
              <Coins className="w-7 h-7 text-[#ffe170]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Cairo'] text-base font-bold text-white uppercase">
                Who Moves First?
              </span>
              <span className="text-xs text-[#a98891]">
                System flips an algorithmic 50/50 token. First mover gets initiative; second mover gets retrospective balance.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLUES LEGEND (THE CENTERPIECE DEDUCTION MATRIX) */}
      <div className="relative bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#ff479b]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#e9c400]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff479b] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Signal Recognition
            </span>
            <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
              The Deduction Matrix
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a98891] max-w-md">
            Clues are calculated in real-time after every submitted attempt. Memorize these three tactical signatures:
          </p>
        </div>

        {/* 3 Prominent Rows */}
        <div className="flex flex-col gap-3">
          {/* PICO */}
          <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#ffe170]/60 transition-all shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#e9c400] flex items-center justify-center shadow-[0_0_16px_rgba(233,196,0,0.5)] shrink-0">
                <span className="font-['Cairo'] text-4xl font-black text-black leading-none">7</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_#ffe170]" />
                  <span className="font-['Cairo'] text-lg font-black text-[#ffe170] uppercase tracking-wider">
                    PICO
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#e9c400]/20 text-[#ffe170] text-[10px] font-bold uppercase">
                    Exact Lock
                  </span>
                </div>
                <p className="text-sm text-[#e2e2ea] mt-0.5">
                  Correct digit locked in the <strong className="text-[#ffe170]">exact right position</strong>.
                </p>
              </div>
            </div>

            {tutorialMode === 'advanced' && (
              <div className="flex flex-col md:text-right pl-4 border-l md:border-l-0 border-[#282a30]">
                <span className="text-xs font-bold text-[#ffe170] uppercase">Target Isolation</span>
                <span className="text-xs text-[#a98891]">Digit & Slot verified. Do not shift slot.</span>
              </div>
            )}
          </div>

          {/* PALA */}
          <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#ff479b]/60 transition-all shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#282a30] border-2 border-[#ff479b] flex items-center justify-center shadow-[0_0_16px_rgba(255,46,149,0.35)] shrink-0">
                <span className="font-['Cairo'] text-4xl font-black text-[#ffb0ca] leading-none">1</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#ff479b] bg-transparent shadow-[0_0_8px_#ff479b]" />
                  <span className="font-['Cairo'] text-lg font-black text-[#ff479b] uppercase tracking-wider">
                    PALA
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#ff479b]/20 text-[#ffb0ca] text-[10px] font-bold uppercase">
                    Displaced Match
                  </span>
                </div>
                <p className="text-sm text-[#e2e2ea] mt-0.5">
                  Digit exists inside the vault, but is currently in the <strong className="text-[#ff479b]">wrong slot</strong>.
                </p>
              </div>
            </div>

            {tutorialMode === 'advanced' && (
              <div className="flex flex-col md:text-right pl-4 border-l md:border-l-0 border-[#282a30]">
                <span className="text-xs font-bold text-[#ff479b] uppercase">Permutation Trap</span>
                <span className="text-xs text-[#a98891]">Keep digit; rotate across remaining 3 slots.</span>
              </div>
            )}
          </div>

          {/* MISS */}
          <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0c0e14] border border-[#282a30] flex items-center justify-center opacity-50 shrink-0">
                <span className="font-['Cairo'] text-4xl font-black text-gray-400 line-through leading-none">
                  5
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#33353b]" />
                  <span className="font-['Cairo'] text-lg font-black text-[#a98891] uppercase tracking-wider">
                    MISS
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#282a30] text-[#a98891] text-[10px] font-bold uppercase">
                    Void
                  </span>
                </div>
                <p className="text-sm text-[#a98891] mt-0.5">
                  Digit is totally absent from the secret number. Completely eliminated.
                </p>
              </div>
            </div>

            {tutorialMode === 'advanced' && (
              <div className="flex flex-col md:text-right pl-4 border-l md:border-l-0 border-[#282a30]">
                <span className="text-xs font-bold text-[#a98891] uppercase">Matrix Elimination</span>
                <span className="text-xs text-rose-400">Permanently discard candidate from keypad.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. WORKED EXAMPLE ("A TURN, DISSECTED") */}
      <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00d2ff]">
              Telemetry Breakdown
            </span>
            <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
              A Turn, Dissected
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#111319] border border-[#282a30] px-4 py-1.5 rounded-full text-xs text-[#a98891]">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            <span>Round 03 Simulator</span>
          </div>
        </div>

        {/* Board Comparison */}
        <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opponent Secret (X-Ray) */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a98891] uppercase">
                  Opponent Secret (X-Ray View)
                </span>
                <span className="text-xs font-bold text-[#ffe170]">Vault Target</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { pos: 'Slot 1', val: 3 },
                  { pos: 'Slot 2', val: 7 },
                  { pos: 'Slot 3', val: 1 },
                  { pos: 'Slot 4', val: 9 },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111319] border border-[#282a30] rounded-xl flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-[#a98891]">{s.pos}</span>
                    <span className="font-['Cairo'] text-2xl font-black text-white">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Transmission */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a98891] uppercase">Your Transmission</span>
                <span className="text-xs font-bold text-[#ff479b]">Active Guess</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { pos: 'Pos 1', val: 3, color: 'text-[#ffe170]' },
                  { pos: 'Pos 2', val: 1, color: 'text-[#ffb0ca]' },
                  { pos: 'Pos 3', val: 5, color: 'text-gray-500' },
                  { pos: 'Pos 4', val: 9, color: 'text-[#ffe170]' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111319] border border-[#282a30] rounded-xl flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-[#a98891]">{s.pos}</span>
                    <span className={`font-['Cairo'] text-2xl font-black ${s.color}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Position Dissected Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">Position 1</span>
                <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20 text-[#ffe170] text-[10px] font-bold">
                  PICO
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">3 == 3</div>
              <p className="text-xs text-[#a98891]">Right digit & right slot. Target anchored.</p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">Position 2</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ff479b]/20 text-[#ffb0ca] text-[10px] font-bold">
                  PALA
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">1 vs 7</div>
              <p className="text-xs text-[#a98891]">
                1 exists in vault (Slot 3), but transmitted into Slot 2.
              </p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">Position 3</span>
                <span className="px-1.5 py-0.5 rounded bg-[#282a30] text-[#a98891] text-[10px] font-bold">
                  MISS
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">5 vs 1</div>
              <p className="text-xs text-[#a98891]">5 is completely unassigned in 3719. Discard it.</p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">Position 4</span>
                <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20 text-[#ffe170] text-[10px] font-bold">
                  PICO
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">9 == 9</div>
              <p className="text-xs text-[#a98891]">
                Identical position and value lock. Second Pico.
              </p>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="bg-[#0c0e14] border border-[#282a30] p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Telemetry Returned:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9c400]/20 text-[#ffe170] text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400]" />
                  2 Picos
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff479b]/20 text-[#ffb0ca] text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff479b]" />
                  1 Pala
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282a30] text-[#a98891] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#33353b]" />
                  1 Miss
                </div>
              </div>
            </div>

            <span className="text-xs text-[#a98891]">
              Note: The clue does NOT specify which digit caused which signal!
            </span>
          </div>
        </div>

        {/* Master Deduction Directive */}
        <div className="bg-[#111319] border border-[#00d2ff]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00d2ff]/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-[#00d2ff]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Cairo'] text-base font-bold text-[#00d2ff] uppercase">
              Master Deduction Directive
            </span>
            <p className="text-xs sm:text-sm text-[#e2e2ea] leading-relaxed">
              If your initial guess yields <strong className="text-[#ffe170]">1 Pico</strong> and{' '}
              <strong className="text-[#ff479b]">2 Palas</strong>, you already possess 3 out of 4 correct vault numbers (75% precision).{' '}
              <strong className="text-white">Never randomize on Turn 2.</strong> Keep 3 numbers, permute positions, and swap only the single suspect candidate.
            </p>
          </div>
        </div>
      </div>

      {/* 5. 12-TURN SUDDEN DEATH PROTOCOL TIMELINE */}
      <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#ff479b]" />
            <span className="font-['Cairo'] text-lg font-black text-white uppercase">
              The 12-Turn Sudden Death Protocol
            </span>
          </div>
          <span className="text-xs font-black text-[#ff479b] uppercase tracking-wider">
            Turn 12 Cap Limit
          </span>
        </div>

        <div className="relative w-full h-3 bg-[#0c0e14] rounded-full overflow-hidden border border-[#282a30]">
          <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#00d2ff] via-[#ff479b] to-rose-500 rounded-full" />
        </div>

        <div className="grid grid-cols-6 md:grid-cols-12 gap-1 text-center text-xs font-bold text-[#a98891]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
            <div key={n}>{n < 10 ? `0${n}` : n}</div>
          ))}
          <div className="text-rose-400 font-black">12 (FINAL)</div>
        </div>

        <p className="text-xs text-[#a98891]">
          If neither duelist decrypts all 4 digits within 12 attempts, the duel terminates in a{' '}
          <strong className="text-white">Tactical Draw</strong>. Both secret vaults are unveiled simultaneously for mutual review.
        </p>
      </div>

      {/* 6. CTA FOOTER BAND */}
      <div className="bg-gradient-to-r from-[#191b21] via-[#201a24] to-[#191b21] border border-[#ff479b]/40 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
            Ready to test your deduction?
          </h2>
          <p className="text-sm text-[#e2bdc7]">
            Jump straight into an offline AI duel or invite a rival in seconds. No download required.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('arena')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            Play Free Now
          </button>
          <button
            onClick={() => onNavigate('play-hub')}
            className="px-6 py-3 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Explore Play Hub
          </button>
        </div>
      </div>
    </div>
  );
};
