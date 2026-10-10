'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface IBoardMove {
  guess: string;
  feedback: { picos: number; palas: number };
}

interface BoardCellProps {
  actor: 'BOT' | 'RIVAL' | 'YOU';
  move: IBoardMove | undefined;
  round: number;
  /** Placeholder text for the slot that is about to be played. */
  pending: string | null;
  /** The pending slot is waiting for the server (shows a spinner). */
  syncing?: boolean;
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** One board slot: the guess, its pico/pala dots and the F/P summary, or the pending placeholder. */
export const BoardCell: React.FC<BoardCellProps> = ({ actor, move, round, pending, syncing = false }) => {
  if (!move) {
    return pending ? (
      <div
        data-testid="pending-cell"
        className="rounded-xl border border-dashed border-[#ff479b]/50 bg-[#ff479b]/5 p-2 flex items-center justify-center gap-2 min-h-[80px] animate-pulse"
      >
        <span className="text-xs font-bold text-[#a98891]">#{pad2(round)}</span>
        {syncing && <Loader2 className="w-3.5 h-3.5 shrink-0 text-[#ffb0ca] animate-spin" />}
        <span className="text-xs font-bold text-[#ffb0ca] uppercase tracking-wider truncate">{pending}</span>
      </div>
    ) : (
      <div aria-hidden className="min-h-[80px]" />
    );
  }

  const { picos, palas } = move.feedback;
  const misses = 4 - picos - palas;

  return (
    <div
      data-testid="move"
      data-actor={actor}
      data-guess={move.guess}
      data-picos={picos}
      data-palas={palas}
      className={`rounded-xl border p-2 flex flex-col gap-1.5 min-h-[80px] ${
        actor === 'YOU'
          ? 'bg-[#111319] border-[#282a30]'
          : 'bg-[#282a30]/50 border-transparent'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-[#a98891] tabular-nums w-5 shrink-0">#{pad2(round)}</span>
        <div className="flex items-center gap-1">
          {move.guess.split('').map((d, i) => (
            <span
              key={i}
              className="w-6 h-8 sm:w-8 sm:h-9 rounded-md bg-[#0c0e14] border border-white/5 flex items-center justify-center font-['Cairo'] font-black text-base text-white"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 pl-6">
        <div className="flex items-center gap-1">
          {Array.from({ length: picos }).map((_, i) => (
            <span
              key={`p${i}`}
              className="w-4 h-4 rounded-full bg-[#e9c400] shadow-[0_0_6px_rgba(233,196,0,0.8)]"
            />
          ))}
          {Array.from({ length: palas }).map((_, i) => (
            <span
              key={`l${i}`}
              className="w-4 h-4 rounded-full bg-transparent border-2 border-[#ff479b] shadow-[0_0_6px_rgba(255,71,155,0.7)]"
            />
          ))}
          {Array.from({ length: misses }).map((_, i) => (
            <span key={`m${i}`} className="w-2.5 h-2.5 rounded-full bg-[#33353b]" />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-bold text-[#e2bdc7] tabular-nums whitespace-nowrap">
          {picos > 0 && `${picos}F `}
          {palas > 0 && `${palas}P`}
          {picos === 0 && palas === 0 && '0'}
        </span>
      </div>
    </div>
  );
};
