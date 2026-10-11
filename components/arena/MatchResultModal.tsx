'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { RESULT_THEME } from '@/components/arena/resultTheme';

export type TMatchOutcome = keyof typeof RESULT_THEME;

export interface IResultStat {
  label: string;
  value: string;
  tone?: 'white' | 'cyan' | 'gold';
}

export interface IResultAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  testId?: string;
}

interface MatchResultModalProps {
  outcome: TMatchOutcome;
  badge: string;
  title: string;
  summary: string;
  /** Revealed secret of the rival, when the mode can show it. */
  secret?: { label: string; digits: number[] } | null;
  stats: IResultStat[];
  primary: IResultAction;
  secondary: IResultAction[];
  /** Mode-specific status line under the buttons (save state, rematch state...). */
  footer?: React.ReactNode;
}

const TONE = { white: 'text-white', cyan: 'text-[#00d2ff]', gold: 'text-[#ffe170]' } as const;

const SECONDARY_GRID: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

/** End-of-match dialog shared by the bot arena and private duels. */
export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  outcome,
  badge,
  title,
  summary,
  secret,
  stats,
  primary,
  secondary,
  footer,
}) => {
  const theme = RESULT_THEME[outcome];
  const ResultIcon = theme.Icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-w-lg w-full max-h-full overflow-y-auto bg-[#191b21] border ${theme.border} rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative`}
      >
        <div className={`absolute -top-20 -left-20 w-56 h-56 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#ff479b]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme.iconBg}`}>
            <ResultIcon className={`w-12 h-12 ${theme.iconColor}`} />
          </div>
          <span
            className={`absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full ${theme.badge} font-['Cairo'] text-xs font-black uppercase`}
          >
            {badge}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span
            data-testid="result-title"
            data-result={outcome}
            className="font-['Cairo'] text-3xl font-black text-white uppercase tracking-tight"
          >
            {title}
          </span>
          <span className="text-sm text-[#e2bdc7]">{summary}</span>
        </div>

        {secret && secret.digits.length === 4 && (
          <div className="w-full p-4 rounded-2xl bg-[#111319] border border-[#282a30] flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a98891]">{secret.label}</span>
            <div className="flex items-center gap-2">
              {secret.digits.map((d, i) => (
                <div
                  key={i}
                  className="w-12 h-14 rounded-xl bg-[#282a30] border border-white/10 flex items-center justify-center shadow-md font-['Cairo'] text-2xl font-black text-[#ffe170]"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 w-full">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#111319] border border-[#282a30] p-2.5 rounded-xl flex flex-col">
              <span className="text-xs text-[#a98891]">{stat.label}</span>
              <span className={`font-['Cairo'] text-base font-bold ${TONE[stat.tone ?? 'white']}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={primary.onClick}
            disabled={primary.disabled || primary.busy}
            data-testid={primary.testId}
            className="w-full h-14 px-6 rounded-2xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-base uppercase tracking-wider whitespace-nowrap shadow-[0_0_24px_rgba(255,46,149,0.45)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {primary.busy ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> : primary.icon} {primary.label}
          </button>
          <div className={`grid gap-3 ${SECONDARY_GRID[secondary.length] ?? 'grid-cols-2'}`}>
            {secondary.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled || action.busy}
                data-testid={action.testId}
                className="h-12 px-3 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white font-['Cairo'] font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {action.busy ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : action.icon} {action.label}
              </button>
            ))}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
};
