'use client';

import React from 'react';
import { Delete, Loader2, RotateCcw, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TurnComposerProps {
  draft: number[];
  canPlay: boolean;
  /** The guess is being sent to the server. */
  busy?: boolean;
  errorMsg: string | null;
  turnLabel: string;
  onPress: (digit: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
}

/** Inline guess entry for wide screens (md+): replaces the "write turn" modal. */
export const TurnComposer: React.FC<TurnComposerProps> = ({
  draft,
  canPlay,
  busy = false,
  errorMsg,
  turnLabel,
  onPress,
  onBackspace,
  onClear,
  onSubmit,
}) => {
  const { t } = useTranslation('arena');
  const complete = draft.length === 4;

  return (
    <div
      data-testid="turn-composer"
      className={`rounded-2xl border bg-[#191b21] p-3 flex flex-col gap-3 transition-opacity ${
        canPlay ? 'border-[#ff479b]/40' : 'border-[#282a30] opacity-60'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex gap-2 shrink-0" aria-label={turnLabel}>
          {[0, 1, 2, 3].map((slot) => {
            const filled = slot < draft.length;
            const active = canPlay && slot === draft.length;
            return (
              <div
                key={slot}
                className={`h-14 w-14 rounded-xl flex items-center justify-center font-['Cairo'] text-2xl font-black transition-all ${
                  filled
                    ? 'bg-[#282a30] border-2 border-[#ff479b] text-white shadow-[0_0_15px_rgba(255,71,155,0.3)]'
                    : active
                      ? 'bg-[#0c0e14] border-2 border-[#00d2ff] text-[#00d2ff] animate-pulse'
                      : 'bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40'
                }`}
              >
                {filled ? draft[slot] : active ? '_' : '·'}
              </div>
            );
          })}
        </div>

        <span
          role={errorMsg ? 'alert' : undefined}
          className={`flex-1 min-w-0 text-xs ${errorMsg ? 'text-rose-400 font-bold' : 'text-[#a98891]'}`}
        >
          {errorMsg ?? (canPlay ? t('write.hint', { count: Math.max(0, 4 - draft.length) }) : t('write.waiting'))}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            disabled={!canPlay || draft.length === 0}
            title={t('write.clear')}
            aria-label={t('write.clear')}
            className="h-12 w-12 rounded-xl bg-[#111319] hover:bg-[#282a30] border border-[#282a30] text-[#a98891] flex items-center justify-center transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onBackspace}
            disabled={!canPlay || draft.length === 0}
            title={t('write.undo')}
            aria-label={t('write.undo')}
            className="h-12 w-12 rounded-xl bg-[#111319] hover:bg-[#282a30] border border-[#282a30] text-rose-400 flex items-center justify-center transition-all disabled:opacity-40"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={onSubmit}
            disabled={!canPlay || !complete}
            className={`h-12 px-6 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              canPlay && complete
                ? 'bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-95'
                : 'bg-[#282a30] text-[#a98891] opacity-70'
            }`}
          >
            {t('write.submit')} {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const used = draft.includes(n);
          return (
            <button
              key={n}
              onClick={() => onPress(n)}
              disabled={!canPlay || used}
              aria-label={`${t('write.digitAlpha')} ${n}`}
              className={`h-11 rounded-xl font-['Cairo'] text-xl font-black transition-all ${
                used
                  ? 'bg-[#282a30] text-[#ff479b] opacity-40 border border-[#33353b]'
                  : 'bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95 disabled:opacity-40'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
};
