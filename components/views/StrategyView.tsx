'use client';

import React from 'react';
import { ArrowRight, Lightbulb, Target, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppView } from '@/types/game';

interface IStat {
  value: string;
  label: string;
}

interface IPrinciple {
  title: string;
  body: string;
}

/** One solved game; candidate counts were computed by brute force over the 3024 valid codes. */
const EXAMPLE_TURNS = [
  { guess: '1234', picos: 1, palas: 2, left: 180 },
  { guess: '1325', picos: 1, palas: 1, left: 32 },
  { guess: '1462', picos: 0, palas: 2, left: 9 },
  { guess: '2374', picos: 2, palas: 1, left: 1 },
  { guess: '7314', picos: 4, palas: 0, left: 1 },
] as const;

interface StrategyViewProps {
  onNavigate: (view: AppView) => void;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation('howToPlay');
  const stats = t('strategy.stats', { returnObjects: true }) as IStat[];
  const principles = t('strategy.principles.items', { returnObjects: true }) as IPrinciple[];
  const turnNotes = t('strategy.example.turns', { returnObjects: true }) as string[];
  const mistakes = t('strategy.mistakes.items', { returnObjects: true }) as string[];

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-10">
      {/* HERO + guide tabs */}
      <div className="relative flex flex-col items-center text-center gap-3 pt-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-44 bg-[#00d2ff]/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#191b21] border border-[#282a30]">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
          <span className="text-xs font-black text-[#a5e7ff] uppercase tracking-widest">{t('strategy.eyebrow')}</span>
        </div>
        <h1 className="font-['Cairo'] text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
          {t('strategy.title')}
        </h1>
        <p className="text-base text-[#e2bdc7] max-w-xl">{t('strategy.subtitle')}</p>

        <div className="mt-4 p-1 bg-[#191b21] border border-[#282a30] rounded-full flex items-center shadow-lg">
          <button
            onClick={() => onNavigate('how-to-play')}
            className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider text-[#a98891] hover:text-white transition-all"
          >
            {t('hero.easyToggle')}
          </button>
          <button
            aria-current="page"
            className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#00d2ff] to-[#47d6ff] text-black shadow-[0_0_20px_rgba(0,210,255,0.4)]"
          >
            {t('hero.advancedToggle')}
          </button>
        </div>
      </div>

      {/* KEY NUMBERS */}
      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-[#191b21] border border-[#282a30] p-4 flex flex-col gap-1">
              <span className="font-['Cairo'] text-3xl font-black text-[#ffe170] leading-none">{stat.value}</span>
              <span className="text-xs text-[#a98891] leading-snug">{stat.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#a98891]">{t('strategy.statsNote')}</p>
      </section>

      {/* PRINCIPLES */}
      <section className="flex flex-col gap-5">
        <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase flex items-center gap-3">
          <Lightbulb className="w-7 h-7 text-[#00d2ff]" /> {t('strategy.principles.title')}
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="rounded-2xl bg-[#191b21] border border-[#282a30] hover:border-[#00d2ff]/40 transition-colors p-5 flex gap-4"
            >
              <span className="shrink-0 w-9 h-9 rounded-xl bg-[#00d2ff]/15 text-[#00d2ff] font-['Cairo'] font-black flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-['Cairo'] text-base font-bold text-white leading-snug">{principle.title}</h3>
                <p className="text-sm text-[#e2e2ea]/80 leading-relaxed">{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* WORKED EXAMPLE */}
      <section className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-5">
        <div>
          <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase flex items-center gap-3">
            <Target className="w-7 h-7 text-[#ff479b]" /> {t('strategy.example.title')}
          </h2>
          <p className="text-sm text-[#a98891] mt-1">{t('strategy.example.intro')}</p>
        </div>

        <ol className="flex flex-col gap-3">
          {EXAMPLE_TURNS.map((turn, index) => {
            const solved = turn.picos === 4;
            return (
              <li
                key={turn.guess}
                className={`rounded-2xl border p-4 flex flex-col lg:flex-row lg:items-center gap-4 ${
                  solved ? 'bg-[#e9c400]/10 border-[#e9c400]/50' : 'bg-[#111319] border-[#282a30]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span className="text-[11px] font-bold text-[#a98891] uppercase w-16">
                    {t('strategy.example.turn', { n: index + 1 })}
                  </span>
                  <div className="flex items-center gap-1">
                    {turn.guess.split('').map((digit, slot) => (
                      <span
                        key={slot}
                        className="w-10 h-11 rounded-lg bg-[#0c0e14] border border-white/5 flex items-center justify-center font-['Cairo'] font-black text-xl text-white"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-[#e9c400]/20 text-[#ffe170]">
                      {turn.picos} Pico{turn.picos === 1 ? '' : 's'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#ff479b]/20 text-[#ffb0ca]">
                      {turn.palas} Pala{turn.palas === 1 ? '' : 's'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#282a30] text-[#00d2ff] text-xs font-bold tabular-nums">
                    {solved ? t('strategy.example.win') : t('strategy.example.left', { count: turn.left })}
                  </span>
                </div>
                <p className="text-sm text-[#e2e2ea] leading-relaxed">{turnNotes[index]}</p>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-[#e2bdc7]">{t('strategy.example.outro')}</p>
      </section>

      {/* COMMON MISTAKES */}
      <section className="rounded-3xl bg-[#191b21] border border-rose-500/30 p-6 sm:p-8 flex flex-col gap-4">
        <h2 className="font-['Cairo'] text-2xl font-black text-white uppercase flex items-center gap-3">
          <TriangleAlert className="w-6 h-6 text-rose-400" /> {t('strategy.mistakes.title')}
        </h2>
        <ul className="flex flex-col gap-2.5 text-sm text-[#e2e2ea]/85 leading-relaxed list-disc pl-5 marker:text-rose-400">
          {mistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#191b21] via-[#201a24] to-[#191b21] border border-[#ff479b]/40 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">{t('strategy.cta.title')}</h2>
          <p className="text-sm text-[#e2bdc7]">{t('strategy.cta.body')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('how-to-play')}
            className="px-6 py-3 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            {t('strategy.cta.basics')}
          </button>
          <button
            onClick={() => onNavigate('play-hub')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {t('strategy.cta.play')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
