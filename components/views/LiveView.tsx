'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppView } from '@/types/game';

interface LiveViewProps {
  onNavigate: (view: AppView) => void;
}

/** Placeholder until the backend can stream other players' matches. Shows no fabricated data. */
export const LiveView: React.FC<LiveViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation('common');

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-16 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-[#00d2ff]/15 text-[#00d2ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.3)]">
        <Radio className="w-8 h-8" />
      </div>
      <span className="px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30] text-xs font-bold text-[#a5e7ff] uppercase tracking-widest">
        {t('live.eyebrow')}
      </span>
      <h1 className="font-['Cairo'] text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
        {t('live.title')}
      </h1>
      <p className="max-w-xl text-sm sm:text-base text-[#e2bdc7]">{t('live.body')}</p>
      <button
        onClick={() => onNavigate('how-to-play')}
        className="mt-2 px-6 py-3 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold uppercase tracking-wider transition-all"
      >
        {t('live.cta')}
      </button>
    </div>
  );
};
