'use client';

import React from 'react';
import {
  Sparkles,
  Bot,
  Key,
  Globe,
  Timer,
  Flame,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AppView } from '@/types/game';

interface LandingViewProps {
  onNavigate: (view: AppView) => void;
  onLaunchMatch: (mode: 'ai' | 'private' | 'global') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onLaunchMatch }) => {
  return (
    <div className="w-full relative overflow-hidden pt-6 md:pt-10">
      {/* Ambient background glows */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#ff479b]/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-48 w-[450px] h-[450px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-[#e9c400]/10 blur-[150px] pointer-events-none rounded-full" />

      {/* 1. HERO SECTION */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column */}
          <div className="flex-1 max-w-xl flex flex-col items-start">
            {/* Eyebrow Chip */}
            <div className="p-px rounded-full bg-gradient-to-r from-purple-500 via-[#ff479b] to-[#00d2ff] inline-block shadow-[0_0_16px_rgba(255,71,155,0.35)]">
              <div className="bg-[#111319] px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-[#a5e7ff] uppercase">
                  1v1 NUMBER DEDUCTION GAME
                </span>
              </div>
            </div>

            {/* Giant Headline */}
            <h1 className="font-['Cairo'] font-black text-5xl sm:text-6xl md:text-7xl leading-[1.04] tracking-tight text-white mt-5 uppercase">
              Crack the <br />
              <span className="bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#ff479b] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,46,149,0.55)]">
                code.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#e2e2ea]/90 text-lg sm:text-xl leading-relaxed mt-4 font-normal">
              Guess your rival's secret 4-digit number before they guess yours.{' '}
              <strong className="text-[#e9c400] font-black">Pico</strong> means right spot.{' '}
              <strong className="text-[#ff479b] font-black">Pala</strong> means wrong spot.{' '}
              First to 4 Picos wins.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => onLaunchMatch('ai')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#ff479b] text-white font-bold text-base uppercase tracking-wider shadow-[0_0_25px_rgba(255,46,149,0.55)] hover:shadow-[0_0_35px_rgba(255,46,149,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Play now — it's free</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('how-to-play')}
                className="px-6 py-4 rounded-xl bg-[#191b21] hover:bg-[#282a30] border border-[#33353b] text-white font-semibold text-base transition-all text-center"
              >
                Read Rules & Strategy
              </button>
            </div>

            {/* Trust Line */}
            <div className="mt-6 text-sm text-[#a98891] flex items-center gap-2 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-[#00d2ff]" />
              <span>Free to play · Zero ads · Made by Auron Tale Games</span>
            </div>
          </div>

          {/* Right Column: High-fidelity Annotated Live Match Board Mockup */}
          <div className="flex-1 w-full flex justify-center relative">
            {/* Ghost Background Numbers */}
            <div className="select-none pointer-events-none absolute -top-10 -right-4 text-[160px] font-black text-white/[0.03] leading-none font-['Cairo']">
              1
            </div>
            <div className="select-none pointer-events-none absolute top-1/2 -left-12 text-[160px] font-black text-white/[0.03] leading-none font-['Cairo']">
              4
            </div>
            <div className="select-none pointer-events-none absolute -bottom-10 right-10 text-[160px] font-black text-white/[0.03] leading-none font-['Cairo']">
              9
            </div>

            {/* Mockup Card */}
            <div className="bg-[#191b21]/95 border border-[#33353b] rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl w-full max-w-md ring-1 ring-white/10 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#282a30]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="font-['Cairo'] text-xs font-bold text-gray-200 tracking-wider uppercase">
                    LIVE MATCH · TURN 5/12
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252833] border border-white/5">
                  <Bot className="w-3.5 h-3.5 text-[#ff479b]" />
                  <span className="text-xs text-gray-300 font-semibold">Bot (Hard)</span>
                </div>
              </div>

              {/* Your Secret Vault Strip */}
              <div className="bg-[#0c0e14] rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between border border-[#282a30]">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="font-['Cairo'] text-xs font-bold uppercase tracking-wider text-gray-400">
                    YOUR SECRET
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[5, 8, 4, 1].map((d, i) => (
                    <span
                      key={i}
                      className="w-7 h-8 rounded bg-[#282a30] border border-white/10 flex items-center justify-center font-['Cairo'] text-sm font-black text-[#e9c400]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deduction Stream Rows */}
              <div className="flex flex-col gap-2">
                {/* Row 1 */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111319] border border-[#282a30] hover:border-white/15 transition-colors">
                  <span className="font-['Cairo'] text-xs text-gray-500 font-bold">#01</span>
                  <div className="flex items-center gap-2 font-['Cairo'] text-lg font-black tracking-widest text-white">
                    <span>3</span>
                    <span>7</span>
                    <span>1</span>
                    <span>9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.5)]"
                        title="Pala"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-700/50" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                      2P · 1L
                    </span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111319] border border-[#282a30] hover:border-white/15 transition-colors">
                  <span className="font-['Cairo'] text-xs text-gray-500 font-bold">#02</span>
                  <div className="flex items-center gap-2 font-['Cairo'] text-lg font-black tracking-widest text-white">
                    <span>2</span>
                    <span>8</span>
                    <span>1</span>
                    <span>4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.5)]"
                        title="Pala"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.5)]"
                        title="Pala"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-700/50" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                      1P · 2L
                    </span>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111319] border border-[#282a30] hover:border-white/15 transition-colors">
                  <span className="font-['Cairo'] text-xs text-gray-500 font-bold">#03</span>
                  <div className="flex items-center gap-2 font-['Cairo'] text-lg font-black tracking-widest text-white">
                    <span>7</span>
                    <span>4</span>
                    <span>9</span>
                    <span>1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.5)]"
                        title="Pala"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_8px_rgba(255,71,155,0.5)]"
                        title="Pala"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-700/50" />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-700/50" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                      2 Palas
                    </span>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111319] border border-[#282a30] hover:border-white/15 transition-colors">
                  <span className="font-['Cairo'] text-xs text-gray-500 font-bold">#04</span>
                  <div className="flex items-center gap-2 font-['Cairo'] text-lg font-black tracking-widest text-white">
                    <span>5</span>
                    <span>8</span>
                    <span>1</span>
                    <span>4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]"
                        title="Pico"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-700/50" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                      3 Picos
                    </span>
                  </div>
                </div>

                {/* Row 5: WINNING ROW! */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#e9c400]/15 border-2 border-[#e9c400] shadow-[0_0_24px_rgba(233,196,0,0.3)] relative">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#e9c400] text-black font-['Cairo'] text-[11px] font-black tracking-wide">
                      WIN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-['Cairo'] text-xl font-black tracking-widest text-[#ffe170]">
                    <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20">4</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20">9</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20">1</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20">7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_10px_#ffd600]" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_10px_#ffd600]" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_10px_#ffd600]" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_10px_#ffd600]" />
                    </div>
                    <span className="text-[10px] text-[#ffe170] font-black hidden sm:inline">
                      VICTORY · 4 PICOS!
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend Strip */}
              <div className="mt-4 pt-3 border-t border-[#282a30] flex items-center justify-between text-xs text-[#e2e2ea]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.8)]" />
                  <span className="font-semibold">Pico = Exact Spot</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_6px_rgba(255,71,155,0.6)]" />
                  <span className="font-semibold">Pala = Wrong Spot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE RIVALS (GAME MODE STRIP) */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-14" id="battlefields">
        <div className="mb-8">
          <h2 className="font-['Cairo'] font-black text-3xl text-white tracking-wide uppercase">
            THE RIVALS
          </h2>
          <p className="text-[#a98891] text-sm mt-1">
            Choose your battlefield and test your mental agility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Versus AI */}
          <div
            onClick={() => onLaunchMatch('ai')}
            className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/60 hover:bg-[#1d1f26] transition-all group shadow-xl cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-['Cairo'] font-bold text-xl text-white">Versus AI</h3>
              <p className="text-[#a98891] text-sm mt-1 leading-relaxed">
                Challenge our smart bot with custom difficulty heuristics.
              </p>
              <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full w-fit mt-3">
                Works offline
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-[#282a30] flex items-center justify-between text-purple-300 font-semibold text-sm group-hover:text-purple-200">
              <span>Play Duel</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Private Room */}
          <div
            onClick={() => onLaunchMatch('private')}
            className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between hover:border-[#ff479b]/60 hover:bg-[#1d1f26] transition-all group shadow-xl cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff5959] to-[#ff2e95] flex items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-['Cairo'] font-bold text-xl text-white">Private Room</h3>
              <p className="text-[#a98891] text-sm mt-1 leading-relaxed">
                Host a private battle room or join via 6-digit match key.
              </p>
              <div className="bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono text-xs font-semibold px-3 py-1 rounded-full w-fit mt-3">
                Code ABCD12
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-[#282a30] flex items-center justify-between text-pink-300 font-semibold text-sm group-hover:text-pink-200">
              <span>Create Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Global Room */}
          <div
            onClick={() => onLaunchMatch('global')}
            className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between hover:border-[#00d2ff]/60 hover:bg-[#1d1f26] transition-all group shadow-xl cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d2ff] to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-['Cairo'] font-bold text-xl text-white">Global Arena</h3>
              <p className="text-[#a98891] text-sm mt-1 leading-relaxed">
                Challenge worldwide duelists with real-time ELO rating stakes.
              </p>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full w-fit mt-3">
                Match in &lt; 30s
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-[#282a30] flex items-center justify-between text-emerald-300 font-semibold text-sm group-hover:text-emerald-200">
              <span>Quick Match</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 NUMERICAL STEPS) */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-14" id="how-it-works">
        <div className="bg-[#14161e] border border-[#282a30] rounded-3xl p-6 sm:p-10 md:p-14">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-['Cairo'] font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
              How Pico & Pala Works
            </h2>
            <p className="text-[#a98891] text-base mt-2">
              Three simple rules. Infinite tactical depth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Cairo'] font-black text-3xl text-[#ff479b]">01</span>
                  <Key className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-['Cairo'] font-bold text-xl text-white mb-2">
                  Set your secret number
                </h3>
                <p className="text-[#a98891] text-sm leading-relaxed">
                  Pick 4 unique numbers from 1 to 9. Zero is prohibited. No duplicate digits
                  allowed.
                </p>
              </div>
              <div className="bg-[#0c0e14] border border-[#282a30] p-4 rounded-xl flex items-center justify-center gap-2 mt-6">
                {[3, 7, 1, 9].map((n, i) => (
                  <span
                    key={i}
                    className="w-9 h-11 rounded-lg bg-[#282a30] border border-white/10 flex items-center justify-center font-['Cairo'] text-lg font-black text-white"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Cairo'] font-black text-3xl text-[#00d2ff]">02</span>
                  <Zap className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-['Cairo'] font-bold text-xl text-white mb-2">Trade guesses</h3>
                <p className="text-[#a98891] text-sm leading-relaxed">
                  Analyze feedback each turn. Compare Picos and Palas to isolate valid positions.
                </p>
              </div>
              <div className="bg-[#0c0e14] border border-[#282a30] p-4 rounded-xl flex flex-col gap-2.5 mt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">Pico</span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.8)]" />
                    <span className="text-gray-400">Right digit & slot</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">Pala</span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_6px_rgba(255,71,155,0.6)]" />
                    <span className="text-gray-400">Right digit, wrong slot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Cairo'] font-black text-3xl text-[#e9c400]">03</span>
                  <Sparkles className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-['Cairo'] font-bold text-xl text-white mb-2">
                  First to 4 Picos wins
                </h3>
                <p className="text-[#a98891] text-sm leading-relaxed">
                  Crack the rival's code decisively. Sound deduction rewards quick victories before
                  12 turns.
                </p>
              </div>
              <div className="bg-[#0c0e14] border border-[#282a30] p-4 rounded-xl flex items-center justify-between mt-6">
                <span className="px-2.5 py-1 rounded bg-[#e9c400]/20 text-[#ffe170] font-['Cairo'] text-xs font-black tracking-wide">
                  VICTORY
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((_, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full bg-[#e9c400] shadow-[0_0_10px_rgba(233,196,0,0.9)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('how-to-play')}
            className="text-[#ff479b] hover:text-[#ff5959] font-bold text-center block mx-auto mt-8 text-base tracking-wide transition-colors"
          >
            Read the complete rules & breakdown →
          </button>
        </div>
      </section>

      {/* 4. WHY YOU'LL LOVE IT */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-14" id="why-youll-love-it">
        <div className="text-center mb-10">
          <h2 className="font-['Cairo'] font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Why You'll Love It
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00d2ff] mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="font-['Cairo'] font-bold text-lg text-white">Fast 2-5 minute matches</h3>
            <p className="text-[#a98891] text-sm mt-2 leading-relaxed">
              Quick cognitive duels designed for sharp coffee breaks or intense competitive ladder
              climbing.
            </p>
          </div>

          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ff5959] mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-['Cairo'] font-bold text-lg text-white">3 AI difficulty levels</h3>
            <p className="text-[#a98891] text-sm mt-2 leading-relaxed">
              From casual puzzle warmups to grandmaster bot heuristics that anticipate your next
              deduction.
            </p>
          </div>

          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ff479b] mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-['Cairo'] font-bold text-lg text-white">
              Real-time & async online play
            </h3>
            <p className="text-[#a98891] text-sm mt-2 leading-relaxed">
              Smooth instant deduction turns with seamless reconnection, replay analysis, and match
              logs.
            </p>
          </div>

          <div className="bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#e9c400] mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-['Cairo'] font-bold text-lg text-white">Full stats & streaks</h3>
            <p className="text-[#a98891] text-sm mt-2 leading-relaxed">
              Analyze your win rates, average turns to solve, and Pico precision over lifetime
              matches.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BAND */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-14">
        <div className="border border-[#ff479b]/30 shadow-[0_0_50px_rgba(255,46,149,0.15)] bg-gradient-to-r from-[#191b21] via-[#201a24] to-[#191b21] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff479b]/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffb0ca] block mb-2">
              ZERO INSTALL REQUIRED
            </span>
            <h2 className="font-['Cairo'] font-black text-3xl md:text-4xl text-white uppercase">
              Your secret number is waiting.
            </h2>
            <p className="text-gray-300 text-base mt-2">
              Play right in your browser or take the battle on mobile decks.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onLaunchMatch('ai')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(255,46,149,0.45)] hover:shadow-[0_0_35px_rgba(255,46,149,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Play Free
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => alert('Pico & Pala Web PWA / iOS Ready')}
                className="px-4 py-3 rounded-xl bg-[#252833] hover:bg-[#2f3340] border border-white/10 text-white transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <Smartphone className="w-4 h-4 text-[#a5e7ff]" />
                <span>iOS</span>
              </button>
              <button
                onClick={() => alert('Pico & Pala Web PWA / Android Ready')}
                className="px-4 py-3 rounded-xl bg-[#252833] hover:bg-[#2f3340] border border-white/10 text-white transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
