'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Disables both buttons while the confirmed action is running. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible confirmation modal: Escape and the backdrop cancel, focus starts on "cancel". */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy = false,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  // Portaled to <body>: the header's backdrop-filter would otherwise become the containing block of `fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm bg-[#191b21] border border-[#33353b] rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h2 id="confirm-dialog-title" className="font-['Cairo'] text-xl font-black text-white">
            {title}
          </h2>
          <p id="confirm-dialog-description" className="text-sm text-[#e2bdc7] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
            className="h-11 rounded-xl bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="h-11 rounded-xl bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
