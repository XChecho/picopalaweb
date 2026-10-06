'use client';

import React from 'react';
import {
  Check,
  X,
  Ban,
  Lock,
  Timer,
  Coins,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Bot,
  Key,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { AppView } from '@/types/game';

interface HowToPlayViewProps {
  onNavigate: (view: AppView) => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation('howToPlay');

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-10">
      {/* 1. HERO STRIP */}
      <div className="relative flex flex-col items-center text-center gap-3 pt-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-44 bg-[#ff479b]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#191b21] border border-[#282a30]">
          <span className="w-2 h-2 rounded-full bg-[#ff479b] animate-pulse" />
          <span className="text-xs font-black text-[#ffb0ca] uppercase tracking-widest">
            {t('hero.eyebrow')}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-['Cairo'] text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
          {t('hero.title')}
        </h1>
        <p className="text-base text-[#e2bdc7] max-w-xl">
          {t('hero.subtitle')}
        </p>

        {/* Guide tabs: two separate screens (basics / advanced strategy) */}
        <div className="mt-4 p-1 bg-[#191b21] border border-[#282a30] rounded-full flex items-center shadow-lg">
          <button
            aria-current="page"
            className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#ff5959] to-[#ff479b] text-white shadow-[0_0_20px_rgba(255,46,149,0.4)]"
          >
            {t('hero.easyToggle')}
          </button>
          <button
            onClick={() => onNavigate('strategy')}
            className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider text-[#a98891] hover:text-white transition-all"
          >
            {t('hero.advancedToggle')}
          </button>
        </div>
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
                  {t('secret.title')}
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#282a30] text-xs font-bold text-[#a98891]">
                {t('secret.step')}
              </span>
            </div>

            <p className="text-sm text-[#e2bdc7] leading-relaxed">
              {t('secret.intro')}
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
                  <span className="text-xs font-bold text-white">{t('secret.digitsRange.title')}</span>
                  <span className="text-[10px] text-[#a98891]">{t('secret.digitsRange.subtitle')}</span>
                </div>
              </div>

              <div className="bg-[#111319] border border-[#282a30] p-3 rounded-xl flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">{t('secret.noZeros.title')}</span>
                  <span className="text-[10px] text-[#a98891]">{t('secret.noZeros.subtitle')}</span>
                </div>
              </div>

              <div className="bg-[#111319] border border-[#282a30] p-3 rounded-xl flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Ban className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-400">{t('secret.noDuplicates.title')}</span>
                  <span className="text-[10px] text-[#a98891] line-through">{t('secret.noDuplicates.subtitle')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#282a30] flex items-center gap-2 text-xs text-[#a98891]">
            <Lock className="w-4 h-4 text-[#ff479b]" />
            <span>{t('secret.footer')}</span>
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
                    {t('guess.title')}
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#282a30] text-xs font-bold text-[#a98891]">
                  {t('guess.step')}
                </span>
              </div>

              <p className="text-sm text-[#e2bdc7] leading-relaxed">
                {t('guess.intro')}
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
                  <span>{t('guess.maxGuesses')}</span>
                </div>
                <span className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider">
                  {t('guess.turnCap')}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#a98891] mt-4">
              {t('guess.footer')}
            </p>
          </div>

          {/* Card 3: Who Starts? */}
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#282a30] flex items-center justify-center shrink-0">
              <Coins className="w-7 h-7 text-[#ffe170]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Cairo'] text-base font-bold text-white uppercase">
                {t('firstMove.title')}
              </span>
              <span className="text-xs text-[#a98891]">
                {t('firstMove.body')}
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
              <Sparkles className="w-4 h-4" /> {t('matrix.eyebrow')}
            </span>
            <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
              {t('matrix.title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a98891] max-w-md">
            {t('matrix.intro')}
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
                    {t('matrix.pico.badge')}
                  </span>
                </div>
                <p className="text-sm text-[#e2e2ea] mt-0.5">
                  <Trans t={t} i18nKey="matrix.pico.description" components={{ b: <strong className="text-[#ffe170]" /> }} />
                </p>
              </div>
            </div>

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
                    {t('matrix.pala.badge')}
                  </span>
                </div>
                <p className="text-sm text-[#e2e2ea] mt-0.5">
                  <Trans t={t} i18nKey="matrix.pala.description" components={{ b: <strong className="text-[#ff479b]" /> }} />
                </p>
              </div>
            </div>

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
                    {t('matrix.miss.label')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#282a30] text-[#a98891] text-[10px] font-bold uppercase">
                    {t('matrix.miss.badge')}
                  </span>
                </div>
                <p className="text-sm text-[#a98891] mt-0.5">
                  {t('matrix.miss.description')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. WORKED EXAMPLE ("A TURN, DISSECTED") */}
      <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00d2ff]">
              {t('example.eyebrow')}
            </span>
            <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
              {t('example.title')}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#111319] border border-[#282a30] px-4 py-1.5 rounded-full text-xs text-[#a98891]">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            <span>{t('example.round')}</span>
          </div>
        </div>

        <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opponent Secret (X-Ray) */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a98891] uppercase">
                  {t('example.opponentSecret')}
                </span>
                <span className="text-xs font-bold text-[#ffe170]">{t('example.vaultTarget')}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { pos: 1, val: 3 },
                  { pos: 2, val: 7 },
                  { pos: 3, val: 1 },
                  { pos: 4, val: 9 },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111319] border border-[#282a30] rounded-xl flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-[#a98891]">{t('example.slot', { n: s.pos })}</span>
                    <span className="font-['Cairo'] text-2xl font-black text-white">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Transmission */}
            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a98891] uppercase">{t('example.yourTransmission')}</span>
                <span className="text-xs font-bold text-[#ff479b]">{t('example.activeGuess')}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { pos: 1, val: 3, color: 'text-[#ffe170]' },
                  { pos: 2, val: 1, color: 'text-[#ffb0ca]' },
                  { pos: 3, val: 5, color: 'text-gray-500' },
                  { pos: 4, val: 9, color: 'text-[#ffe170]' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111319] border border-[#282a30] rounded-xl flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-[#a98891]">{t('example.pos', { n: s.pos })}</span>
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
                <span className="text-[11px] text-[#a98891]">{t('example.position', { n: 1 })}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20 text-[#ffe170] text-[10px] font-bold">
                  PICO
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">3 == 3</div>
              <p className="text-xs text-[#a98891]">{t('example.step.one')}</p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">{t('example.position', { n: 2 })}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ff479b]/20 text-[#ffb0ca] text-[10px] font-bold">
                  PALA
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">1 vs 7</div>
              <p className="text-xs text-[#a98891]">
                {t('example.step.two')}
              </p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">{t('example.position', { n: 3 })}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#282a30] text-[#a98891] text-[10px] font-bold">
                  {t('matrix.miss.label')}
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">5 vs 1</div>
              <p className="text-xs text-[#a98891]">{t('example.step.three')}</p>
            </div>

            <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a98891]">{t('example.position', { n: 4 })}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#e9c400]/20 text-[#ffe170] text-[10px] font-bold">
                  PICO
                </span>
              </div>
              <div className="font-['Cairo'] text-base font-bold text-white">9 == 9</div>
              <p className="text-xs text-[#a98891]">
                {t('example.step.four')}
              </p>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="bg-[#0c0e14] border border-[#282a30] p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {t('example.telemetryReturned')}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9c400]/20 text-[#ffe170] text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400]" />
                  {t('example.result.picos')}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff479b]/20 text-[#ffb0ca] text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff479b]" />
                  {t('example.result.pala')}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282a30] text-[#a98891] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#33353b]" />
                  {t('example.result.miss')}
                </div>
              </div>
            </div>

            <span className="text-xs text-[#a98891]">
              {t('example.note')}
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
              {t('directive.title')}
            </span>
            <p className="text-xs sm:text-sm text-[#e2e2ea] leading-relaxed">
              <Trans
                t={t}
                i18nKey="directive.body"
                components={{
                  yellow: <strong className="text-[#ffe170]" />,
                  pink: <strong className="text-[#ff479b]" />,
                  white: <strong className="text-white" />,
                }}
              />
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
              {t('sudden.title')}
            </span>
          </div>
          <span className="text-xs font-black text-[#ff479b] uppercase tracking-wider">
            {t('sudden.capLimit')}
          </span>
        </div>

        <div className="relative w-full h-3 bg-[#0c0e14] rounded-full overflow-hidden border border-[#282a30]">
          <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#00d2ff] via-[#ff479b] to-rose-500 rounded-full" />
        </div>

        <div className="grid grid-cols-6 md:grid-cols-12 gap-1 text-center text-xs font-bold text-[#a98891]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
            <div key={n}>{n < 10 ? `0${n}` : n}</div>
          ))}
          <div className="text-rose-400 font-black">{t('sudden.final')}</div>
        </div>

        <p className="text-xs text-[#a98891]">
          <Trans t={t} i18nKey="sudden.body" components={{ white: <strong className="text-white" /> }} />
        </p>
      </div>

      {/* GAME MODES (merged here from the former standalone "Game Modes" section) */}
      <section id="modes" className="flex flex-col gap-5">
        <div>
          <h2 className="font-['Cairo'] font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
            {t('modes.title')}
          </h2>
          <p className="text-[#a98891] text-sm mt-1">{t('modes.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Versus AI: the only mode available today */}
          <button
            onClick={() => onNavigate('play-hub')}
            className="text-left bg-[#191b21] border border-[#282a30] rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/60 hover:bg-[#1d1f26] transition-all group shadow-xl"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-['Cairo'] font-bold text-xl text-white">{t('modes.ai.title')}</h3>
              <p className="text-[#a98891] text-sm mt-1 leading-relaxed">{t('modes.ai.description')}</p>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full w-fit mt-3">
                {t('modes.ai.badge')}
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-[#282a30] flex items-center justify-between text-purple-300 font-semibold text-sm group-hover:text-purple-200">
              <span>{t('modes.ai.cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Private and global rooms are not implemented yet */}
          {(['private', 'global'] as const).map((mode) => {
            const Icon = mode === 'private' ? Key : Globe;
            return (
              <div
                key={mode}
                aria-disabled="true"
                className="bg-[#191b21]/60 border border-[#282a30] rounded-2xl p-6 flex flex-col opacity-70"
              >
                <div className="w-12 h-12 rounded-xl bg-[#282a30] flex items-center justify-center text-[#a98891] mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-['Cairo'] font-bold text-xl text-white">{t(`modes.${mode}.title`)}</h3>
                <p className="text-[#a98891] text-sm mt-1 leading-relaxed">{t(`modes.${mode}.description`)}</p>
                <div className="bg-[#e9c400]/15 text-[#ffe170] border border-[#e9c400]/30 text-xs font-semibold px-3 py-1 rounded-full w-fit mt-3">
                  {t(`modes.${mode}.badge`)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CTA FOOTER BAND */}
      <div className="bg-gradient-to-r from-[#191b21] via-[#201a24] to-[#191b21] border border-[#ff479b]/40 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
            {t('cta.title')}
          </h2>
          <p className="text-sm text-[#e2bdc7]">
            {t('cta.body')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('play-hub')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            {t('cta.play')}
          </button>
        </div>
      </div>
    </div>
  );
};
