'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, LogIn, LogOut, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { AppView } from '@/types/game';
import type { IPlayer, TAuthStatus } from '@/types/auth';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onResumeMatch: () => void;
  lang: string;
  onChangeLang: (lang: string) => void;
  activeMatchInProgress?: boolean;
  player: IPlayer | null;
  authStatus: TAuthStatus;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onResumeMatch,
  lang,
  onChangeLang,
  activeMatchInProgress = false,
  player,
  authStatus,
  onLogout,
  isLoggingOut = false,
}) => {
  const { t } = useTranslation('common');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const isAuthenticated = authStatus === 'authenticated';

  // The play hub is reserved for signed-in players; guests only see the public sections.
  const navItems: { label: string; view: AppView }[] = [
    ...(isAuthenticated ? [{ label: t('nav.playHub'), view: 'play-hub' as const }] : []),
    { label: t('nav.live'), view: 'live' },
    { label: t('nav.howToPlay'), view: 'how-to-play' },
    { label: t('nav.records'), view: 'records' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-[#282a30] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
      <div className="h-20 max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 shrink-0 text-left group focus:outline-none cursor-pointer"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="w-10 h-10 rounded-xl shadow-[0_0_18px_rgba(255,46,149,0.45)] group-hover:shadow-[0_0_24px_rgba(255,46,149,0.7)] transition-all"
          />
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
            const isActive =
              currentView === item.view || (item.view === 'how-to-play' && currentView === 'strategy');
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
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
          {/* Active match shortcut: only shown while a real match is in memory */}
          {activeMatchInProgress && (
            <button
              onClick={onResumeMatch}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1f26] border border-[#ff479b]/40 shadow-[0_0_12px_rgba(255,46,149,0.25)] hover:border-[#ff479b] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff479b] animate-ping" />
              <span className="text-xs font-bold text-[#ffb0ca] uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                <Swords className="w-3.5 h-3.5" /> {t('header.matchLive')}
              </span>
            </button>
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

          {/* Session: profile capsule + sign out, or sign in */}
          {isAuthenticated && player ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('records')}
                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#191b21] hover:bg-[#282a30] rounded-full border border-[#282a30] transition-all group"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff479b] to-[#a5e7ff] p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-[#111319] flex items-center justify-center text-[11px] font-black text-white overflow-hidden">
                      {player.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        player.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00d2ff] ring-1 ring-[#191b21]" />
                </div>
                <span className="font-['Cairo'] text-xs font-bold text-[#e2e2ea] group-hover:text-white hidden sm:inline max-w-[120px] truncate">
                  {player.username}
                </span>
              </button>
              <button
                onClick={() => setLogoutConfirmOpen(true)}
                disabled={isLoggingOut}
                title={t('header.signOut')}
                aria-label={t('header.signOut')}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#191b21] text-[#a98891] hover:text-white hover:bg-[#282a30] border border-[#282a30] transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : authStatus === 'anonymous' ? (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#191b21] hover:bg-[#282a30] border border-[#282a30] text-xs font-bold text-[#e2e2ea] whitespace-nowrap transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>{t('header.signIn')}</span>
            </button>
          ) : (
            <div className="w-24 h-9 rounded-full bg-[#191b21] border border-[#282a30] animate-pulse" aria-hidden="true" />
          )}

          {/* Direct CTA: guests are routed to sign-in by the navigation guard */}
          <button
            onClick={() => onNavigate('play-hub')}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-[0_0_18px_rgba(255,46,149,0.4)] hover:shadow-[0_0_24px_rgba(255,46,149,0.7)] hover:scale-105 active:scale-95 transition-all"
          >
            {t('header.play')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title={t('header.signOutConfirm.title')}
        description={
          activeMatchInProgress
            ? t('header.signOutConfirm.bodyActiveMatch')
            : t('header.signOutConfirm.body')
        }
        confirmLabel={t('header.signOutConfirm.confirm')}
        cancelLabel={t('header.signOutConfirm.cancel')}
        busy={isLoggingOut}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          onLogout();
          setLogoutConfirmOpen(false);
        }}
      />
    </header>
  );
};
