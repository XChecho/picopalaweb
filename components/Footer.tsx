'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { AppView } from '@/types/game';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation('common');

  return (
    <footer className="w-full bg-[#0c0e14] border-t border-[#1d1f26] py-10 mt-16 shadow-[0_-1px_12px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand info */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="" width={24} height={24} className="w-6 h-6 rounded-lg" />
            <span className="font-['Cairo'] font-bold text-base text-[#e2e2ea] tracking-tight uppercase">
              Pico & Pala
            </span>
            <span className="text-xs text-[#a98891]">· {t('brand.footerTagline')}</span>
          </div>
          <span className="text-xs text-[#a98891] tracking-wide">
            {t('brand.copyright')}
          </span>
        </div>

        {/* Center: Navigation quick links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#e2bdc7]">
          <button
            onClick={() => onNavigate('how-to-play')}
            className="hover:text-white transition-colors"
          >
            {t('footer.howToPlay')}
          </button>
          <button
            onClick={() => onNavigate('records')}
            className="hover:text-white transition-colors"
          >
            {t('footer.recordsLedger')}
          </button>
          <button
            onClick={() => onNavigate('auth')}
            className="hover:text-white transition-colors"
          >
            {t('footer.duelistProfile')}
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-white transition-colors"
          >
            {t('footer.terms')}
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-white transition-colors"
          >
            {t('footer.privacy')}
          </button>
        </div>
      </div>
    </footer>
  );
};
