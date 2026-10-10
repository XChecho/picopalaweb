"use client";

import React, { useEffect, useRef } from "react";
import { Delete, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DigitPadProps {
  draft: number[];
  disabled?: boolean;
  onChange: (draft: number[]) => void;
  onSubmit: () => void;
  submitLabel: string;
  /** Extra action next to submit (e.g. "random"). */
  secondary?: React.ReactNode;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Four distinct digits 1-9: touch keypad plus keyboard (digits, Backspace, Enter). */
export const DigitPad: React.FC<DigitPadProps> = ({ draft, disabled = false, onChange, onSubmit, submitLabel, secondary }) => {
  const { t } = useTranslation("room");
  const complete = draft.length === 4;

  const press = (digit: number) => {
    if (disabled || draft.length >= 4 || draft.includes(digit)) return;
    onChange([...draft, digit]);
  };

  // One listener for the pad's lifetime; it always reads the latest props through this ref.
  const latest = useRef({ draft, onChange, onSubmit });
  latest.current = { draft, onChange, onSubmit };

  useEffect(() => {
    if (disabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.isComposing) return;
      const target = event.target instanceof Element ? event.target : null;
      // A focused control (or an open dialog) owns the keyboard: Enter must not also submit the guess.
      if (target?.closest("button, input, textarea, select, [role=dialog], [role=alertdialog]")) return;
      if (document.querySelector("[role=alertdialog]")) return;
      const { draft: current, onChange: change, onSubmit: submit } = latest.current;
      if (/^[1-9]$/.test(event.key)) {
        const digit = Number(event.key);
        if (current.length < 4 && !current.includes(digit)) change([...current, digit]);
      } else if (event.key === "Backspace") {
        change(current.slice(0, -1));
      } else if (event.key === "Enter" && current.length === 4) {
        event.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled]);

  return (
    <div className="flex flex-col gap-3" data-testid="digit-pad">
      <div className="flex justify-center gap-2" data-testid="draft" data-value={draft.join("")}>
        {[0, 1, 2, 3].map((slot) => {
          const filled = slot < draft.length;
          return (
            <div
              key={slot}
              className={`h-14 w-14 rounded-xl flex items-center justify-center font-['Cairo'] text-2xl font-black ${
                filled
                  ? "bg-[#282a30] border-2 border-[#ff479b] text-white shadow-[0_0_15px_rgba(255,71,155,0.3)]"
                  : "bg-[#0c0e14] border border-[#282a30] text-[#a98891]/40"
              }`}
            >
              {filled ? draft[slot] : "·"}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
        {DIGITS.map((n) => {
          const used = draft.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => press(n)}
              disabled={disabled || used || complete}
              aria-label={`${t("match.digit")} ${n}`}
              className={`h-11 rounded-xl font-['Cairo'] text-lg font-black transition-all ${
                used
                  ? "bg-[#282a30] text-[#ff479b] opacity-40 border border-[#33353b]"
                  : "bg-[#111319] border border-[#282a30] hover:border-[#ff479b]/60 text-white active:scale-95 disabled:opacity-40"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={disabled || draft.length === 0}
          aria-label={t("match.clear")}
          title={t("match.clear")}
          className="h-11 w-11 shrink-0 rounded-xl bg-[#111319] border border-[#282a30] text-[#a98891] flex items-center justify-center disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(draft.slice(0, -1))}
          disabled={disabled || draft.length === 0}
          aria-label={t("match.undo")}
          title={t("match.undo")}
          className="h-11 w-11 shrink-0 rounded-xl bg-[#111319] border border-[#282a30] text-rose-400 flex items-center justify-center disabled:opacity-40"
        >
          <Delete className="w-4 h-4" />
        </button>
        {secondary}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !complete}
          data-testid="digit-submit"
          className={`h-11 flex-1 rounded-xl font-['Cairo'] font-black text-sm uppercase tracking-wider transition-all ${
            !disabled && complete
              ? "bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white shadow-[0_0_24px_rgba(255,46,149,0.5)] hover:brightness-110 active:scale-95"
              : "bg-[#282a30] text-[#a98891] opacity-70"
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};
