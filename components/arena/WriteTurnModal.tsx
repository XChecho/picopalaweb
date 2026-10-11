'use client';

import React from 'react';
import { Delete, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WriteTurnModalProps {
  turnLabel: string;
  draft: number[];
  errorMsg: string | null;
  /** The guess is being sent to the server. */
  busy?: boolean;
  onPress: (digit: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

/** Mobile guess entry: bottom-sheet number pad opened by the "write turn" button. */
export const WriteTurnModal: React.FC<WriteTurnModalProps> = ({
  turnLabel,
  draft,
  errorMsg,
  busy = false,
  onPress,
  onBackspace,
  onClear,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation('arena');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={() => onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={turnLabel}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#191b21] border border-[#ff479b]/40 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-['Cairo'] font-bold text-sm text-[#ff479b] uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-4 h-4" /> {turnLabel}
          </span>
          <button
            onClick={() => onClose()}
            aria-label={t('write.close')}
            className="w-8 h-8 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const filled = slot < draft.length;
            const active = slot === draft.length;
            return (
              <div
                key={slot}
                className={`h-16 rounded-xl flex items-center justify-center font-['Cairo'] text-3xl font-black transition-all ${
                  filled
                    ? 'bg-[#282a30] border-2 border-[#ff479b] text-white shadow-[0_0_15px_rgba(255,71,155,0.3)]'
                    : active
                      ? 'bg-[#0c0e14] border-2 border-[#00d2ff] text-[#00d2ff] animate-pulse'
                      : 'bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40 opacity-60'
                }`}
              >
                {filled ? draft[slot] : active ? '_' : '·'}
              </div>
            );
          })}
        </div>

        <span
          role={errorMsg ? 'alert' : undefined}
          className={`text-xs text-center ${errorMsg ? 'text-rose-400 font-bold' : 'text-[#a98891]'}`}
        >
          {errorMsg ?? t('write.hint', { count: Math.max(0, 4 - draft.length) })}
        </span>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const used = draft.includes(n);
            return (
              <button
                key={n}
                onClick={() => onPress(n)}
                disabled={used}
                aria-label={`${t('write.digitAlpha')} ${n}`}
                className={`h-14 rounded-xl font-['Cairo'] text-2xl font-black transition-all ${
                  used
                    ? 'bg-[#282a30] text-[#ff479b] opacity-40 cursor-not-allowed border border-[#33353b]'
                    : 'bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClear}
            className="h-11 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#a98891]" /> {t('write.clear')}
          </button>
          <button
            onClick={onBackspace}
            className="h-11 rounded-xl bg-[#111319] hover:bg-[#282a30] active:scale-95 text-[#e2e2ea] border border-[#282a30] flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Delete className="w-3.5 h-3.5 text-rose-400" /> {t('write.undo')}
          </button>
        </div>

        <button
          onClick={onSubmit}
          disabled={draft.length < 4 || busy}
          className={`h-14 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            draft.length === 4
              ? 'bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-95'
              : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
          }`}
        >
          {t('write.submit')} {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
