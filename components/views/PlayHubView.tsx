'use client';

import React, { useEffect, useState } from 'react';
import { Play, Bot, Key, Globe, Swords, Timer, Shield, Sparkles, Flame, Trophy } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Difficulty, GameMode } from '@/types/game';
import type { IPlayerStats, TApiGameMode } from '@/types/player';

const MODE_LABEL_KEY: Record<TApiGameMode, string> = {
  VERSUS_AI: 'stats.modes.ai',
  PRIVATE: 'stats.modes.private',
  GLOBAL: 'stats.modes.global',
};

const DIFFICULTY_OPTIONS = [
  { id: 'novice', level: '01', Icon: Sparkles, text: 'text-emerald-400', border: 'hover:border-emerald-400', glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]', iconBg: 'bg-emerald-400/15' },
  { id: 'tactician', level: '02', Icon: Flame, text: 'text-[#00d2ff]', border: 'hover:border-[#00d2ff]', glow: 'hover:shadow-[0_0_20px_rgba(0,210,255,0.3)]', iconBg: 'bg-[#00d2ff]/15' },
  { id: 'grandmaster', level: '03', Icon: Flame, text: 'text-[#ff479b]', border: 'hover:border-[#ff479b]', glow: 'hover:shadow-[0_0_20px_rgba(255,71,155,0.35)]', iconBg: 'bg-[#ff479b]/15' },
] as const satisfies readonly { id: Difficulty; [key: string]: unknown }[];

export interface IActiveSession {
  difficulty: Difficulty;
  turn: number;
  maxTurns: number;
}

interface PlayHubViewProps {
  username: string;
  stats?: IPlayerStats;
  maxAttempts: number;
  turnSeconds: number;
  session: IActiveSession | null;
  onStartMatch: (mode: GameMode, difficulty?: Difficulty) => void;
  onResumeMatch: () => void;
  onOpenPrivateRoom: () => void;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  username,
  stats,
  maxAttempts,
  turnSeconds,
  session,
  onStartMatch,
  onResumeMatch,
  onOpenPrivateRoom,
}) => {
  const { t } = useTranslation('playHub');
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  useEffect(() => {
    if (!difficultyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDifficultyOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [difficultyOpen]);

  const pickDifficulty = (difficulty: Difficulty) => {
    setDifficultyOpen(false);
    onStartMatch('ai', difficulty);
  };

  const statItems = stats
    ? [
        { label: t('stats.games'), value: stats.totalGames },
        { label: t('stats.wins'), value: stats.wins },
        { label: t('stats.streak'), value: stats.currentStreak },
        { label: t('stats.bestStreak'), value: stats.bestStreak },
      ]
    : [];

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-8">
      {/* 1. PAGE HEADER */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30] text-xs font-bold text-[#a5e7ff] uppercase tracking-widest mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
          <span>{t('header.eyebrow')}</span>
        </div>
        <h1 className="font-['Cairo'] text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
          {t('header.title', { username })}
        </h1>
        <p className="text-[#e2e2ea]/80 text-sm sm:text-base max-w-2xl mt-1">{t('header.subtitle')}</p>
      </div>

      {/* 2. REAL ACTIVE MATCH (only while a match is in memory) */}
      {session && (
        <div className="relative w-full rounded-2xl bg-[#1d1f26] border border-[#282a30] border-l-4 border-l-[#e9c400] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e9c400]/10 via-transparent to-[#ff479b]/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#e9c400]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(233,196,0,0.3)]">
                <Swords className="w-6 h-6 text-[#ffe170]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-2 py-0.5 rounded bg-[#e9c400] text-black font-['Cairo'] text-[11px] font-black uppercase tracking-wider w-fit">
                  {t('session.badge')}
                </span>
                <h3 className="font-['Cairo'] text-white text-lg md:text-xl font-bold tracking-tight">
                  <Trans
                    t={t}
                    i18nKey="session.title"
                    values={{
                      turn: session.turn,
                      max: session.maxTurns,
                      difficulty: t(`difficulty.${session.difficulty}.name`),
                    }}
                    components={{ hl: <span className="text-[#ffe170] font-black" /> }}
                  />
                </h3>
              </div>
            </div>
            <button
              onClick={onResumeMatch}
              className="self-end md:self-auto shrink-0 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{t('session.resume')}</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      )}

      {/* 3. REAL PLAYER STATS */}
      {statItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#191b21] border border-[#282a30] px-4 py-3 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-[#ffe170] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#a98891]">{item.label}</span>
                <span className="font-['Cairo'] text-xl font-black text-white leading-tight">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3b. WINS BY MODE (every mode, not only matches against other players) */}
      {stats && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#a98891]">{t('stats.winsByMode')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.byMode.map((row) => (
              <div
                key={row.mode}
                className="rounded-2xl bg-[#191b21] border border-[#282a30] px-4 py-3 flex items-center justify-between gap-3"
              >
                <span className="text-sm font-bold text-white">{t(MODE_LABEL_KEY[row.mode])}</span>
                <span className="text-xs text-[#a98891] tabular-nums">
                  <span className="font-['Cairo'] text-xl font-black text-[#ffe170]">{row.wins}</span>{' '}
                  {t('stats.winsOf', { games: row.games })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Versus AI: the only available mode */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#191b21] border border-[#282a30] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-[#00d2ff] to-[#a5e7ff]" />
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)] shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-['Cairo'] text-2xl font-black text-white tracking-tight">{t('versusAi.title')}</h2>
              <p className="text-xs text-[#a98891] mt-0.5">{t('versusAi.subtitle')}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#282a30] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#a98891]">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#ffe170]" />
                <span>{t('versusAi.perTurn', { seconds: turnSeconds })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00d2ff]" />
                <span>{t('versusAi.digits')}</span>
              </div>
            </div>
            <button
              onClick={() => setDifficultyOpen(true)}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,46,149,0.4)] hover:shadow-[0_0_35px_rgba(255,46,149,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t('versusAi.play')}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <button
            type="button"
            onClick={onOpenPrivateRoom}
            data-testid="open-private-room"
            className="rounded-3xl bg-[#191b21] border border-[#282a30] hover:border-[#ff479b]/60 p-5 flex items-center gap-4 text-left transition-all hover:shadow-[0_0_25px_rgba(255,46,149,0.2)] active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ff479b]/15 text-[#ff479b] flex items-center justify-center shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <h2 className="font-['Cairo'] text-lg font-black text-white tracking-tight">{t('private.title')}</h2>
              <p className="text-xs text-[#a98891]">{t('private.subtitle')}</p>
            </div>
          </button>

          {/* Not implemented yet: no fake queues */}
          <div
            aria-disabled="true"
            className="rounded-3xl bg-[#191b21]/60 border border-[#282a30] p-5 flex items-center gap-4 opacity-70"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#282a30] flex items-center justify-center text-[#a98891] shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-['Cairo'] text-lg font-black text-white tracking-tight">{t('global.title')}</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#e9c400]/15 text-[#ffe170] text-[11px] font-bold uppercase tracking-wider">
                  {t('comingSoon')}
                </span>
              </div>
              <p className="text-xs text-[#a98891]">{t('global.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DIFFICULTY MODAL */}
      {difficultyOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setDifficultyOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="difficulty-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-[#191b21] border border-[#33353b] rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 text-center">
              <h2 id="difficulty-modal-title" className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white">
                {t('modal.title')}
              </h2>
              <p className="text-sm sm:text-base text-[#a98891]">{t('modal.subtitle')}</p>
            </div>

            <div className="flex flex-col gap-3">
              {DIFFICULTY_OPTIONS.map(({ id, level, Icon, text, border, glow, iconBg }) => (
                <button
                  key={id}
                  onClick={() => pickDifficulty(id)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border border-[#282a30] bg-[#111319] hover:bg-[#1d1f26] active:scale-[0.99] transition-all flex items-center gap-4 ${border} ${glow}`}
                >
                  <div className={`w-14 h-14 rounded-xl ${iconBg} ${text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Cairo'] text-xl font-black text-white">{t(`difficulty.${id}.name`)}</h3>
                      <span className={`text-xs font-bold uppercase ${text}`}>{t('difficulty.level', { level })}</span>
                    </div>
                    <p className="text-sm sm:text-base text-[#e2bdc7] leading-snug">{t(`difficulty.${id}.description`)}</p>
                    <span className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${text}`}>
                      {t('difficulty.guesses', { count: maxAttempts })}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setDifficultyOpen(false)}
              className="mt-1 py-3 rounded-xl text-sm sm:text-base font-bold text-[#e2bdc7] hover:text-white hover:bg-[#282a30] transition-all"
            >
              {t('modal.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
