'use client';

import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Trophy,
  Flame,
  TrendingUp,
  History,
  Shield,
  RefreshCw,
  Check,
  AlertTriangle,
  ChevronRight,
  Swords,
  Globe,
  Sliders,
  Mail,
  Award,
  ExternalLink,
  LogIn,
} from 'lucide-react';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { useAuthStore } from '@/store/useAuthStore';
import { AudioSettings, AppView } from '@/types/game';
import type {
  IMatchHistoryItem,
  IMatchParticipant,
  TApiDifficulty,
  TApiGameMode,
  TMatchModeFilter,
} from '@/types/player';

interface RecordsViewProps {
  onNavigate: (view: AppView) => void;
  audioSettings: AudioSettings;
  onUpdateAudio: (key: keyof AudioSettings, val: boolean) => void;
}

const DIFFICULTY_COLOR: Record<TApiDifficulty, string> = {
  EASY: 'text-emerald-400',
  MEDIUM: 'text-[#00d2ff]',
  HARD: 'text-[#ff479b]',
};

const MODE_KEY: Record<TApiGameMode, 'ai' | 'private' | 'global'> = {
  VERSUS_AI: 'ai',
  PRIVATE: 'private',
  GLOBAL: 'global',
};

interface IMatchRow {
  id: string;
  result: IMatchParticipant['result'];
  mode: 'ai' | 'private' | 'global';
  opponentName: string | null;
  opponentIsAi: boolean;
  aiDifficulty: TApiDifficulty | null;
  eloDelta: number | null;
  turnsTaken: number;
  maxTurns: number;
  date: string;
}

function toMatchRow(match: IMatchHistoryItem, playerId: string): IMatchRow {
  const me = match.participants.find((p) => p.playerId === playerId);
  const opponent = match.participants.find((p) => p.playerId !== playerId);
  const eloBefore = me?.eloBefore ?? null;
  const eloAfter = me?.eloAfter ?? null;
  return {
    id: match.id,
    result: me?.result ?? null,
    mode: MODE_KEY[match.mode],
    opponentName: opponent?.player?.username ?? null,
    opponentIsAi: opponent?.isAi ?? false,
    aiDifficulty: match.aiDifficulty ?? null,
    eloDelta: eloBefore !== null && eloAfter !== null ? eloAfter - eloBefore : null,
    turnsTaken: me?.attemptsUsed ?? 0,
    maxTurns: match.maxTurns,
    date: match.finishedAt ?? match.createdAt,
  };
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  onNavigate,
  audioSettings,
  onUpdateAudio,
}) => {
  const { t, i18n } = useTranslation('records');
  const lang = i18n.language;
  const player = useAuthStore((state) => state.player);
  const authStatus = useAuthStore((state) => state.status);
  const [filterMode, setFilterMode] = useState<TMatchModeFilter>('all');

  const statsQuery = usePlayerStats();
  const historyQuery = useMatchHistory(filterMode);
  const stats = statsQuery.data;

  const dash = '—';
  const formatNumber = (value: number | undefined) =>
    value === undefined ? dash : value.toLocaleString(lang);
  const formatDecimal = (value: number) => (Math.round(value * 10) / 10).toLocaleString(lang);
  const winRate =
    stats && stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 1000) / 10 : 0;
  const avgDecrypt = stats && stats.totalGames > 0 ? stats.totalAttempts / stats.totalGames : null;
  const avgTurnPace = stats && stats.totalAttempts > 0 ? stats.totalDurationSec / stats.totalAttempts : null;

  const matchRows = player
    ? (historyQuery.data?.pages.flatMap((page) => page.matches) ?? []).map((m) => toMatchRow(m, player.id))
    : [];
  const historyTotal = historyQuery.data?.pages.at(-1)?.total ?? 0;

  const dateFormatter = new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' });
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? dash : dateFormatter.format(date);
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-8">
      {/* 1. TOP BREADCRUMB & HEADER AREA */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb & Node status */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#a98891]">
          <div className="flex items-center gap-1 font-bold">
            <span
              onClick={() => onNavigate('play-hub')}
              className="hover:text-[#ff479b] cursor-pointer transition-colors uppercase"
            >
              {t('breadcrumb.hq')}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#ff479b] uppercase">{t('breadcrumb.records')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#191b21] text-xs font-bold text-white border border-[#282a30]">
              {lang.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Hero Duelist Identity Card */}
        {player && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#191b21] border border-[#282a30] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#ff479b]/15 via-[#00d2ff]/10 to-transparent blur-3xl pointer-events-none" />

          {/* Avatar & Duelist Bio */}
          <div className="flex items-center gap-5 relative z-10">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#ff5959] to-[#ff2e95] blur-md opacity-75 animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-[#282a30] p-1 shadow-2xl flex items-center justify-center overflow-hidden border border-white/10">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#111319] to-[#282a30] flex items-center justify-center text-3xl font-black text-[#ffb0ca]">
                  {player.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.avatarUrl}
                      alt={player.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    player.username.slice(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00d2ff] flex items-center justify-center shadow-[0_0_8px_rgba(0,210,255,0.8)] ring-2 ring-[#191b21]">
                <Check className="w-3 h-3 text-black stroke-[3]" />
              </span>
            </div>

            {/* Name & Details */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Cairo'] text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                  {player.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#282a30] text-xs font-bold text-[#ffe170] flex items-center gap-1 border border-white/5">
                  <Award className="w-3.5 h-3.5" />
                  {t('profile.rankTitle', {
                    rank: t(`ranks.${player.rank}`, { ns: 'common' }),
                    elo: player.elo.toLocaleString(lang),
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[#a98891] text-xs sm:text-sm">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {player.email}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-3 shrink-0 relative z-10 flex-wrap">
            <button
              onClick={() => onNavigate('play-hub')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>{t('profile.enterArena')}</span>
            </button>
          </div>
        </div>
        )}
      </div>

      {authStatus !== 'authenticated' || !player ? (
        authStatus === 'anonymous' ? (
          <div className="rounded-3xl bg-[#191b21] border border-[#282a30] shadow-2xl p-10 sm:p-14 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#282a30] flex items-center justify-center text-[#ff479b] mb-5">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase mb-2">
              {t('anonymous.title')}
            </h1>
            <p className="text-sm text-[#a98891] max-w-md mb-6">{t('anonymous.description')}</p>
            <button
              onClick={() => onNavigate('auth')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> {t('anonymous.cta')}
            </button>
          </div>
        ) : (
          <div className="space-y-3" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-3xl bg-[#282a30]/40 animate-pulse" />
            ))}
          </div>
        )
      ) : (
      <>
      {/* 2. HERO STATS ROW (4 PRIORITY CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Games Played */}
        <div className="rounded-3xl p-5 bg-[#191b21] border border-[#282a30] shadow-xl relative overflow-hidden flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/10 via-transparent to-transparent opacity-50" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider uppercase text-[#a98891]">
              {t('stats.gamesPlayed')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282a30] flex items-center justify-center text-[#00d2ff]">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-['Cairo'] text-5xl font-black tracking-tight text-white leading-none">
              {formatNumber(stats?.totalGames)}
            </div>
            <div className="text-xs text-[#00d2ff] flex items-center gap-1 mt-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats ? t('stats.record', { wins: stats.wins, losses: stats.losses, draws: stats.draws }) : dash}
            </div>
          </div>
        </div>

        {/* Total Victories */}
        <div className="rounded-3xl p-5 bg-[#191b21] border border-[#282a30] shadow-xl relative overflow-hidden flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffe170]/10 via-transparent to-transparent opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider uppercase text-[#a98891]">
              {t('stats.totalVictories')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282a30] flex items-center justify-center text-[#ffe170]">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-['Cairo'] text-5xl font-black tracking-tight text-white leading-none">
              {formatNumber(stats?.wins)}
            </div>
            <div className="text-xs text-[#ffe170] flex items-center gap-1 mt-1 font-bold">
              <Check className="w-3.5 h-3.5" />
              {stats ? t('stats.winRateOf', { rate: winRate.toLocaleString(lang) }) : dash}
            </div>
          </div>
        </div>

        {/* Win Ratio (With Gold Radial Gauge Chart) */}
        <div className="rounded-3xl p-5 bg-[#191b21] border border-[#282a30] shadow-xl relative overflow-hidden flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e9c400]/10 via-transparent to-transparent opacity-40" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider uppercase text-[#a98891]">
              {t('stats.winRatio')}
            </span>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#282a30]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#ffe170]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${winRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-[10px] text-[#ffe170] font-black">%</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-['Cairo'] text-5xl font-black tracking-tight text-[#ffe170] leading-none drop-shadow-[0_0_12px_rgba(255,214,0,0.3)]">
              {stats ? winRate.toLocaleString(lang) : dash}%
            </div>
            <div className="text-xs text-[#a98891] flex items-center gap-1 mt-1">
              <Award className="w-3.5 h-3.5 text-[#ffe170]" />
              {t('stats.currentElo', { elo: player?.elo.toLocaleString(lang) ?? dash })}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="rounded-3xl p-5 bg-[#191b21] border border-[#282a30] shadow-xl relative overflow-hidden flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff479b]/20 via-transparent to-transparent opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold tracking-wider uppercase text-[#a98891]">
              {t('stats.currentStreak')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282a30] flex items-center justify-center text-[#ff479b]">
              <Flame className="w-5 h-5 fill-[#ff479b]" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-['Cairo'] text-5xl font-black tracking-tight text-white leading-none flex items-center gap-2">
              <span className="text-[#ff479b]">🔥</span>
              <span>{formatNumber(stats?.currentStreak)}</span>
              <span className="text-base font-bold text-[#a98891] uppercase">{t('stats.wins')}</span>
            </div>
            <div className="text-xs text-[#a98891] flex items-center gap-1 mt-1">
              <Award className="w-3.5 h-3.5 text-[#ff479b]" />
              {t('stats.personalBest', { count: stats?.bestStreak ?? 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY METRIC STRIP */}
      <div className="w-full rounded-2xl bg-[#191b21] border border-[#282a30] p-4 shadow-lg overflow-x-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center min-w-[700px] gap-2">
          {/* Segment 1: Draws */}
          <div className="flex flex-col px-4 py-1">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold">
              {t('metrics.draws')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-white">{formatNumber(stats?.draws)}</span>
          </div>

          {/* Segment 2: Longest Streak */}
          <div className="flex flex-col px-4 py-1 bg-[#282a30]/30 rounded-xl">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold">
              {t('metrics.longestStreak')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-[#ffb0ca]">
              {stats ? t('metrics.winsValue', { count: stats.bestStreak }) : dash}
            </span>
          </div>

          {/* Segment 3: Avg. Decrypt */}
          <div className="flex flex-col px-4 py-1">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold">
              {t('metrics.avgDecrypt')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-[#00d2ff]">
              {avgDecrypt === null ? dash : t('metrics.turnsValue', { count: Math.round(avgDecrypt * 10) / 10 })}
            </span>
          </div>

          {/* Segment 4: Total Picos */}
          <div className="flex flex-col px-4 py-1 bg-[#282a30]/30 rounded-xl">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.6)]" />
              {t('metrics.totalPicos')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-[#ffe170]">
              {formatNumber(stats?.totalPicos)}
            </span>
          </div>

          {/* Segment 5: Total Palas */}
          <div className="flex flex-col px-4 py-1">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff479b] bg-transparent shadow-[0_0_8px_rgba(255,71,155,0.6)]" />
              {t('metrics.totalPalas')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-[#ff479b]">
              {formatNumber(stats?.totalPalas)}
            </span>
          </div>

          {/* Segment 6: Avg. Turn Pace */}
          <div className="flex flex-col px-4 py-1 bg-[#282a30]/30 rounded-xl">
            <span className="text-xs text-[#a98891] uppercase tracking-wider font-semibold">
              {t('metrics.avgTurnPace')}
            </span>
            <span className="font-['Cairo'] text-2xl font-bold text-white">
              {avgTurnPace === null ? dash : `${formatDecimal(avgTurnPace)}s`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. MATCH HISTORY & DEDUCTION LOGS */}
      <div className="rounded-3xl bg-[#1d1f26] border border-[#282a30] shadow-2xl overflow-hidden flex flex-col">
        {/* Toolbar & Filters */}
        <div className="p-6 flex flex-col gap-4 bg-[#282a30]/40 border-b border-[#282a30]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#33353b] flex items-center justify-center text-[#ff479b]">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-['Cairo'] text-lg font-black uppercase text-white">
                  {t('history.title')}
                </h2>
                <p className="text-xs text-[#a98891]">
                  {t('history.subtitle')}
                </p>
              </div>
            </div>

            {/* Mode Filters */}
            <div className="flex items-center p-1 rounded-full bg-[#0c0e14] border border-[#282a30] shrink-0 self-start md:self-auto">
              {(['all', 'ai', 'private', 'global'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                    filterMode === m
                      ? 'bg-[#282a30] text-white shadow-md'
                      : 'text-[#a98891] hover:text-white'
                  }`}
                >
                  {t(`filters.${m}`)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {historyQuery.isPending ? (
          /* Loading Shimmer */
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-[#282a30]/40 animate-pulse" />
            ))}
          </div>
        ) : historyQuery.isError ? (
          /* Error State */
          <div className="p-12 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-['Cairo'] text-2xl font-bold text-rose-400 uppercase mb-2">
              {t('error.title')}
            </h3>
            <p className="text-sm text-[#a98891] max-w-md mb-6">
              {t('error.description')}
            </p>
            <button
              onClick={() => void historyQuery.refetch()}
              className="px-6 py-2.5 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> {t('error.retry')}
            </button>
          </div>
        ) : matchRows.length === 0 ? (
          /* Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center py-20">
            <div className="flex items-center gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-2xl bg-[#282a30] border border-[#33353b] flex items-center justify-center font-['Cairo'] text-3xl font-black text-[#a98891]"
                >
                  ?
                </div>
              ))}
            </div>
            <h3 className="font-['Cairo'] text-2xl font-black text-white uppercase mb-2">
              {t('empty.title')}
            </h3>
            <p className="text-sm text-[#a98891] max-w-md mb-6">
              {t('empty.description')}
            </p>
            <button
              onClick={() => onNavigate('play-hub')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4" /> {t('empty.cta')}
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#191b21] text-xs font-bold text-[#a98891] uppercase tracking-wider border-b border-[#282a30]">
                  <th className="py-3 px-6">{t('table.result')}</th>
                  <th className="py-3 px-4">{t('table.mode')}</th>
                  <th className="py-3 px-4">{t('table.opponent')}</th>
                  <th className="py-3 px-4">{t('table.stakes')}</th>
                  <th className="py-3 px-4">{t('table.turnsTaken')}</th>
                  <th className="py-3 px-6">{t('table.timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282a30] text-sm">
                {matchRows.map((m) => {
                  const opponentName = m.opponentIsAi
                    ? t('opponents.ai')
                    : (m.opponentName ?? t('opponents.unknown'));
                  const deltaLabel =
                    m.eloDelta === null
                      ? t('table.unranked')
                      : t('table.eloDelta', {
                          delta: m.eloDelta > 0 ? `+${m.eloDelta}` : m.eloDelta < 0 ? `${m.eloDelta}` : '±0',
                        });
                  return (
                    <tr key={m.id} className="hover:bg-[#282a30]/50 transition-colors group">
                      {/* Result */}
                      <td className="py-4 px-6">
                        {m.result ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              m.result === 'WIN'
                                ? 'bg-[#e9c400]/20 text-[#ffe170]'
                                : m.result === 'LOSS'
                                ? 'bg-rose-950/40 text-rose-400'
                                : 'bg-[#282a30] text-[#a98891]'
                            }`}
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            {t(`results.${m.result}`)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#a98891]">{dash}</span>
                        )}
                      </td>

                      {/* Mode */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#00d2ff]/15 text-[#00d2ff] text-xs font-bold">
                          <Globe className="w-3 h-3" />
                          {t(`modes.${m.mode}`)}
                        </span>
                      </td>

                      {/* Opponent */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#282a30] flex items-center justify-center font-bold text-xs text-[#ffb0ca]">
                            {m.opponentIsAi ? 'AI' : opponentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="font-['Cairo'] text-sm font-bold text-white">
                              {opponentName}
                            </span>
                            {m.opponentIsAi && m.aiDifficulty && (
                              <span
                                data-testid="ai-difficulty"
                                className={`text-[11px] font-bold uppercase tracking-wide ${DIFFICULTY_COLOR[m.aiDifficulty]}`}
                              >
                                {t(`difficulty.${m.aiDifficulty}`)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ELO change */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-bold ${
                            m.eloDelta === null
                              ? 'text-[#a98891]'
                              : m.eloDelta > 0
                              ? 'text-[#ffe170]'
                              : m.eloDelta < 0
                              ? 'text-rose-400'
                              : 'text-white'
                          }`}
                        >
                          {deltaLabel}
                        </span>
                      </td>

                      {/* Turns Taken */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-white">
                          {m.turnsTaken}/{m.maxTurns}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-xs text-[#a98891]">{formatDate(m.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c0e14] border-t border-[#282a30]">
              <span className="text-xs text-[#a98891]">
                <Trans
                  t={t}
                  i18nKey="table.showing"
                  values={{ shown: matchRows.length, total: historyTotal }}
                  components={{ strong: <strong className="text-white font-bold" /> }}
                />
              </span>
              {historyQuery.hasNextPage && (
                <button
                  onClick={() => void historyQuery.fetchNextPage()}
                  disabled={historyQuery.isFetchingNextPage}
                  className="px-4 py-1.5 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold transition-all disabled:opacity-60"
                >
                  {historyQuery.isFetchingNextPage ? t('table.loadingMore') : t('table.loadMore')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      </>
      )}

      {/* 5. DUELIST CONFIGURATION (3-CARD LAYOUT) */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-['Cairo'] text-2xl font-black uppercase text-white">
            {t('config.title')}
          </h2>
          <p className="text-xs text-[#a98891]">
            {t('config.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Audio & Feedback */}
          <div className="rounded-3xl bg-[#191b21] border border-[#282a30] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#282a30] flex items-center justify-center text-[#00d2ff]">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cairo'] text-base font-bold text-white">
                    {t('audio.title')}
                  </h3>
                  <p className="text-xs text-[#a98891]">{t('audio.subtitle')}</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                {[
                  {
                    key: 'soundEffects' as const,
                  },
                  {
                    key: 'matchAmbientMusic' as const,
                  },
                  {
                    key: 'hapticFeedback' as const,
                  },
                  {
                    key: 'turnAlerts' as const,
                  },
                ].map((item) => {
                  const active = audioSettings[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{t(`audio.${item.key}.title`)}</div>
                        <div className="text-[11px] text-[#a98891]">{t(`audio.${item.key}.desc`)}</div>
                      </div>
                      <button
                        onClick={() => onUpdateAudio(item.key, !active)}
                        className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                          active
                            ? 'bg-gradient-to-r from-[#ff479b] to-[#ff2e95] justify-end'
                            : 'bg-[#282a30] justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282a30] text-[11px] text-[#a98891]">
              {t('audio.footer')}
            </div>
          </div>

          {/* Card 2: Account */}
          {player && (
          <div className="rounded-3xl bg-[#191b21] border border-[#282a30] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#282a30] flex items-center justify-center text-[#ff479b]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cairo'] text-base font-bold text-white">
                    {t('account.title')}
                  </h3>
                  <p className="text-xs text-[#a98891]">{t('account.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Item */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#a98891] uppercase font-bold">
                    {t('account.email')}
                  </span>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#111319] border border-[#282a30]">
                    <span className="text-xs font-bold text-white truncate">{player?.email}</span>
                  </div>
                </div>

                {/* Username Item */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#a98891] uppercase font-bold">
                    {t('account.username')}
                  </span>
                  <div className="p-3 rounded-xl bg-[#111319] border border-[#282a30]">
                    <span className="text-xs font-bold text-white truncate block">{player?.username}</span>
                  </div>
                </div>

                {/* Member since */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#a98891] uppercase font-bold">
                    {t('account.memberSince')}
                  </span>
                  <div className="p-3 rounded-xl bg-[#111319] border border-[#282a30]">
                    <span className="text-xs font-bold text-white">
                      {player ? formatDate(player.createdAt) : dash}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          )}

          {/* Card 3: About & Integrity */}
          <div className="rounded-3xl bg-[#191b21] border border-[#282a30] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#282a30] flex items-center justify-center text-[#ffe170]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cairo'] text-base font-bold text-white">
                    {t('about.title')}
                  </h3>
                  <p className="text-xs text-[#a98891]">{t('about.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#111319] border border-[#282a30] flex items-center justify-between">
                  <span className="text-xs text-[#a98891]">{t('about.clientEngine')}</span>
                  <span className="font-mono text-xs font-bold text-[#00d2ff]">
                    v1.0.0 (Build #2024.10)
                  </span>
                </div>

                <div className="flex flex-col gap-1 pt-1 text-xs">
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(t('about.termsAlert'));
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#282a30] flex items-center justify-between text-[#e2bdc7] hover:text-white transition-colors"
                  >
                    <span>{t('about.terms')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(t('about.privacyAlert'));
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#282a30] flex items-center justify-between text-[#e2bdc7] hover:text-white transition-colors"
                  >
                    <span>{t('about.privacy')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#fairplay"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(t('about.fairPlayAlert'));
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#282a30] flex items-center justify-between text-[#e2bdc7] hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                      {t('about.fairPlay')}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282a30] text-center">
              <span className="text-[11px] text-[#a98891] uppercase tracking-wider block font-bold">
                {t('about.crafted')}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
