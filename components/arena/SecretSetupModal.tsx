'use client';

import React, { useEffect, useState } from 'react';
import { Delete, Loader2, Lock, Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateSecretNumber } from '@/lib/gameLogic';

interface SecretSetupModalProps {
  description: string;
  onLock: (secret: string) => void;
  onCancel: () => void;
  /** The secret is being sent to the server. */
  busy?: boolean;
  errorMsg?: string | null;
  /** Extra line under the keypad (e.g. the setup countdown). */
  hint?: string | null;
}

/** Secret entry modal shared by the bot arena and private duels. */
export const SecretSetupModal: React.FC<SecretSetupModalProps> = ({
  description,
  onLock,
  onCancel,
  busy = false,
  errorMsg = null,
  hint = null,
}) => {
  const { t } = useTranslation('arena');
  const [draft, setDraft] = useState<number[]>([]);

  const press = (n: number) => {
    setDraft((prev) => (prev.includes(n) || prev.length >= 4 ? prev : [...prev, n]));
  };
  const lock = () => {
    if (draft.length === 4 && !busy) onLock(draft.join(''));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // A confirmation dialog on top owns the keyboard.
      if (document.querySelector('[role=alertdialog]')) return;
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        press(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setDraft((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        lock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-md bg-[#191b21] border border-[#33353b] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#e9c400]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.3)]">
          <Lock className="w-7 h-7 text-[#ffe170]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Cairo'] text-2xl font-black uppercase text-white">{t('setup.title')}</span>
          <span className="text-sm text-[#a98891]">{description}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-16 rounded-xl flex items-center justify-center font-['Cairo'] text-3xl font-black ${
                i < draft.length
                  ? 'bg-[#282a30] border-2 border-[#e9c400] text-[#ffe170]'
                  : 'bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40'
              }`}
            >
              {i < draft.length ? draft[i] : '·'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const used = draft.includes(n);
            return (
              <button
                key={n}
                onClick={() => press(n)}
                disabled={used}
                className={`h-12 rounded-xl font-['Cairo'] text-xl font-black transition-all ${
                  used
                    ? 'bg-[#282a30] text-[#ff479b] opacity-40 cursor-not-allowed'
                    : 'bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={() => setDraft((prev) => prev.slice(0, -1))}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#e2e2ea] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Delete className="w-3.5 h-3.5" /> {t('setup.undo')}
          </button>
          <button
            onClick={() => setDraft(generateSecretNumber().split('').map(Number))}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#e2e2ea] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" /> {t('setup.random')}
          </button>
          <button
            onClick={onCancel}
            className="h-10 rounded-xl bg-[#111319] border border-[#282a30] text-[#a98891] text-xs font-bold uppercase tracking-wider"
          >
            {t('setup.cancel')}
          </button>
        </div>

        {hint && <p className="text-xs font-bold text-[#ffe170]">{hint}</p>}
        {errorMsg && (
          <p role="alert" className="text-xs font-bold text-rose-400">
            {errorMsg}
          </p>
        )}

        <button
          onClick={lock}
          disabled={draft.length < 4 || busy}
          className={`w-full py-3 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            draft.length === 4
              ? 'bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-lg hover:brightness-110 active:scale-95'
              : 'bg-[#282a30] text-[#a98891] opacity-70 cursor-not-allowed'
          }`}
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('setup.lock')}
        </button>
      </div>
    </div>
  );
};
