'use client';

import React from 'react';
import { EyeOff, Lock } from 'lucide-react';

interface ColumnHeaderProps {
  side: 'opponent' | 'you';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  digits: number[] | null;
  secretLabel: string;
  attemptsLabel: string;
}

/** Player card above each board column: name, secret (or "????") and guesses left. */
export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  side,
  title,
  subtitle,
  icon,
  digits,
  secretLabel,
  attemptsLabel,
}) => (
  <div
    data-testid={`column-${side}`}
    className={`rounded-2xl border p-2 sm:p-3 flex flex-col gap-2 min-w-0 ${
      side === 'you'
        ? 'bg-gradient-to-br from-[#e9c400]/10 via-[#191b21] to-[#191b21] border-[#e9c400]/30'
        : 'bg-[#191b21] border-[#282a30]'
    }`}
  >
    <div className="flex items-center justify-between gap-1 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-7 h-7 shrink-0 rounded-lg bg-[#282a30] flex items-center justify-center">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="font-['Cairo'] text-sm sm:text-base font-black text-white uppercase leading-tight truncate">
            {title}
          </span>
          <span className="text-xs text-[#a98891] leading-tight truncate">{subtitle}</span>
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-[#a98891] tabular-nums">{attemptsLabel}</span>
    </div>

    <div className="flex items-center justify-center gap-1" aria-label={secretLabel}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg border flex items-center justify-center font-['Cairo'] text-lg font-black ${
            digits
              ? 'bg-[#282a30] border-white/10 text-[#ffe170]'
              : 'bg-[#111319] border-white/5 text-[#a98891]'
          }`}
        >
          {digits ? digits[i] : '?'}
        </span>
      ))}
      {digits ? (
        <EyeOff className="w-3.5 h-3.5 text-[#a98891] ml-1 hidden sm:block" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-[#a98891] ml-1 hidden sm:block" />
      )}
    </div>
  </div>
);
