'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, Globe, Shield, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { AppView } from '@/types/game';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  lang: string;
  onChangeLang: (lang: string) => void;
  activeMatchInProgress?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  soundEnabled,
  onToggleSound,
  lang,
  onChangeLang,
  activeMatchInProgress = false,
}) => {
  const { t } = useTranslation('common');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems: { label: string; view: AppView }[] = [
    { label: t('nav.playHub'), view: 'play-hub' },
    { label: t('nav.liveArena'), view: 'arena' },
    { label: t('nav.howToPlay'), view: 'how-to-play' },
    { label: t('nav.gameModes'), view: 'landing' },
    { label: t('nav.records'), view: 'records' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-[#282a30] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
      <div className="h-20 max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 shrink-0 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5959] to-[#ff2e95] p-[2px] shadow-[0_0_18px_rgba(255,46,149,0.45)] group-hover:shadow-[0_0_24px_rgba(255,46,149,0.7)] transition-all">
            <div className="w-full h-full bg-[#111319] rounded-[10px] flex items-center justify-center">
              <span className="font-['Cairo'] font-black text-xs tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,46,149,0.8)]">
                P&P
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Cairo'] font-black text-xl tracking-tight text-[#e2e2ea] group-hover:text-[#ffb0ca] transition-colors uppercase leading-none">
                Pico & Pala
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#282a30] text-[10px] font-bold text-[#a5e7ff] tracking-wider uppercase">
                1v1
              </span>
            </div>
            <span className="text-[11px] text-[#a98891] tracking-wide hidden sm:block">
              {t('brand.tagline')}
            </span>
          </div>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#191b21] rounded-full border border-[#282a30]/80">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-[#282a30] text-white shadow-[0_0_12px_rgba(255,176,202,0.2)]'
                    : 'text-[#e2bdc7]/80 hover:text-white hover:bg-[#282a30]/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side Utilities & User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Active Session Indicator or Node Sync Pill */}
          {activeMatchInProgress ? (
            <button
              onClick={() => onNavigate('arena')}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1f26] border border-[#ff479b]/40 shadow-[0_0_12px_rgba(255,46,149,0.25)] hover:border-[#ff479b] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff479b] animate-ping" />
              <span className="text-xs font-bold text-[#ffb0ca] uppercase tracking-wider flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> {t('header.matchLive')}
              </span>
            </button>
          ) : (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30]">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#a5e7ff] uppercase tracking-wider">
                {t('header.nodeSynced')}
              </span>
            </div>
          )}

          {/* Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191b21] hover:bg-[#282a30] border border-[#282a30] text-xs font-bold text-[#e2e2ea] transition-all"
              title={t('header.changeLanguage')}
              aria-label={t('header.changeLanguage')}
            >
              <Globe className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#282a30] border border-[#33353b] shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                {SUPPORTED_LANGUAGES.map((code) => ({ code, label: LANGUAGE_LABELS[code] })).map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onChangeLang(item.code);
                      setLangMenuOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                      lang === item.code
                        ? 'bg-[#191b21] text-[#ffb0ca]'
                        : 'text-[#e2e2ea] hover:bg-[#33353b]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {lang === item.code && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-[#191b21] text-[#00d2ff] hover:bg-[#282a30] border border-[#282a30]'
                : 'bg-[#191b21] text-[#a98891] hover:bg-[#282a30] border border-[#282a30]'
            }`}
            title={soundEnabled ? t('header.mute') : t('header.unmute')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Profile Capsule */}
          <button
            onClick={() => onNavigate('records')}
            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#191b21] hover:bg-[#282a30] rounded-full border border-[#282a30] transition-all group"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff479b] to-[#a5e7ff] p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#111319] flex items-center justify-center text-[11px] font-black text-white">
                  C
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00d2ff] ring-1 ring-[#191b21]" />
            </div>
            <span className="font-['Cairo'] text-xs font-bold text-[#e2e2ea] group-hover:text-white hidden sm:inline">
              duelist#4821
            </span>
          </button>

          {/* Direct CTA */}
          <button
            onClick={() => onNavigate(currentView === 'arena' ? 'play-hub' : 'arena')}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_18px_rgba(255,46,149,0.4)] hover:shadow-[0_0_24px_rgba(255,46,149,0.7)] hover:scale-105 active:scale-95 transition-all"
          >
            {currentView === 'arena' ? t('header.modes') : t('header.playArena')}
          </button>
        </div>
      </div>
    </header>
  );
};
