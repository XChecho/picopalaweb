"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/lib/api";
import { PrivateMatch } from "@/components/room/PrivateMatch";
import { useActiveMatch } from "@/hooks/useHumanMatch";
import { useCancelRoom, useCreateRoom, useJoinRoom, useRoomState } from "@/hooks/useRoom";
import { roomErrorKey } from "@/lib/roomErrors";

const ROOM_CODE_KEY = "pp_room_code";
const CODE_PATTERN = /^[A-Z0-9]{6}$/;

// The host's pending room survives a reload for as long as the tab lives; the backend expires it anyway.
function readStoredCode(): string | null {
  try {
    return sessionStorage.getItem(ROOM_CODE_KEY);
  } catch {
    return null;
  }
}
function storeCode(code: string | null): void {
  try {
    if (code) sessionStorage.setItem(ROOM_CODE_KEY, code);
    else sessionStorage.removeItem(ROOM_CODE_KEY);
  } catch {
    // Storage can be blocked; the room then just is not restored after a reload.
  }
}

const card = "rounded-3xl bg-[#191b21] border border-[#282a30] p-5 sm:p-6 flex flex-col gap-4";

function Waiting({ code, onMatch, onClosed }: { code: string; onMatch: (matchId: string) => void; onClosed: () => void }) {
  const { t } = useTranslation("room");
  const room = useRoomState(code);
  const cancel = useCancelRoom();
  const [copied, setCopied] = useState(false);

  const matchId = room.data?.matchId ?? null;
  // Only a definitive answer drops the room: a transient failure (5xx, 429, offline) keeps polling.
  const gone =
    room.data?.status === "CLOSED" ||
    room.data?.status === "EXPIRED" ||
    (room.error instanceof ApiError && room.error.status === 404);

  useEffect(() => {
    if (matchId) onMatch(matchId);
  }, [matchId, onMatch]);
  useEffect(() => {
    if (gone) onClosed();
  }, [gone, onClosed]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be denied; the code is on screen anyway.
    }
  };

  return (
    <div className={`${card} items-center text-center`}>
      <Loader2 className="w-7 h-7 text-[#a5e7ff] animate-spin" />
      <h2 className="font-['Cairo'] text-2xl font-black text-white">{t("waiting.title")}</h2>
      <p className="text-sm text-[#a98891]">{t("waiting.subtitle")}</p>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-widest text-[#a98891]">{t("waiting.codeLabel")}</span>
        <span data-testid="room-code" className="font-['Cairo'] text-5xl font-black tracking-[0.3em] text-white pl-[0.3em]">
          {code}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={copy}
          className="px-5 py-2.5 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? t("waiting.copied") : t("waiting.copy")}
        </button>
        <button
          onClick={() =>
            cancel.mutate(code, {
              onSuccess: onClosed,
              // 404: already gone. Anything else (e.g. 409: a guest just joined) must be re-read, not discarded.
              onError: (error) => {
                if (error instanceof ApiError && error.status === 404) onClosed();
                else void room.refetch();
              },
            })
          }
          disabled={cancel.isPending}
          data-testid="cancel-room"
          className="px-5 py-2.5 rounded-full border border-[#33353b] text-[#a98891] hover:text-rose-400 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {t("waiting.cancel")}
        </button>
      </div>
    </div>
  );
}

function Lobby({ onWaiting, onMatch }: { onWaiting: (code: string) => void; onMatch: (matchId: string) => void }) {
  const { t } = useTranslation("room");
  const create = useCreateRoom();
  const join = useJoinRoom();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const submitJoin = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(normalized)) {
      setCodeError(true);
      return;
    }
    setCodeError(false);
    join.mutate(normalized, { onSuccess: (joined) => onMatch(joined.room.matchId) });
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className={card}>
        <div className="w-12 h-12 rounded-2xl bg-[#ff479b]/15 text-[#ff479b] flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <h2 className="font-['Cairo'] text-xl font-black text-white">{t("create.title")}</h2>
        <p className="text-sm text-[#a98891] flex-1">{t("create.description")}</p>
        <button
          onClick={() => create.mutate(undefined, { onSuccess: (room) => onWaiting(room.code) })}
          disabled={create.isPending}
          data-testid="create-room"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,46,149,0.4)] disabled:opacity-60"
        >
          {t("create.button")}
        </button>
        {create.isError && (
          <p role="alert" className="text-sm text-rose-400 font-bold">{t(roomErrorKey(create.error))}</p>
        )}
      </div>

      <form onSubmit={submitJoin} className={card} noValidate>
        <div className="w-12 h-12 rounded-2xl bg-[#00d2ff]/15 text-[#00d2ff] flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="font-['Cairo'] text-xl font-black text-white">{t("join.title")}</h2>
        <p className="text-sm text-[#a98891]">{t("join.description")}</p>
        <label htmlFor="room-code-input" className="sr-only">{t("join.label")}</label>
        <input
          id="room-code-input"
          data-testid="join-input"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder={t("join.placeholder")}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={6}
          className="h-12 rounded-xl bg-[#0c0e14] border border-[#282a30] focus:border-[#00d2ff] outline-none text-center font-['Cairo'] text-2xl font-black tracking-[0.3em] text-white placeholder:text-[#a98891]/30"
        />
        <button
          type="submit"
          disabled={join.isPending}
          data-testid="join-submit"
          className="px-6 py-3 rounded-full bg-[#282a30] hover:bg-[#33353b] text-white font-black text-sm uppercase tracking-wider disabled:opacity-60"
        >
          {t("join.button")}
        </button>
        {(codeError || join.isError) && (
          <p role="alert" className="text-sm text-rose-400 font-bold">
            {t(codeError ? "errors.invalidCode" : roomErrorKey(join.error))}
          </p>
        )}
      </form>
    </div>
  );
}

export const PrivateRoomView: React.FC = () => {
  const { t } = useTranslation("room");
  const active = useActiveMatch();
  const [hostCode, setHostCode] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore a pending host room after a reload (sessionStorage is not readable during SSR).
  useEffect(() => {
    setHostCode(readStoredCode());
    setRestored(true);
  }, []);

  // Resume an unfinished private duel (reload, other tab or device).
  const activeId = active.data?.mode === "PRIVATE" ? (active.data.id ?? null) : null;
  useEffect(() => {
    if (!activeId) return;
    storeCode(null);
    setHostCode(null);
    setMatchId((current) => current ?? activeId);
  }, [activeId]);

  const startWaiting = (code: string) => {
    storeCode(code);
    setHostCode(code);
  };
  const clearWaiting = React.useCallback(() => {
    storeCode(null);
    setHostCode(null);
  }, []);
  const enterMatch = React.useCallback(
    (id: string) => {
      storeCode(null);
      setHostCode(null);
      setMatchId(id);
    },
    [],
  );
  const exitMatch = () => {
    setMatchId(null);
    void active.refetch();
  };

  let body: React.ReactNode;
  if (!restored || (active.isPending && !matchId)) {
    body = <p className="text-center text-[#a98891]">{t("loading")}</p>;
  } else if (matchId) {
    body = <PrivateMatch matchId={matchId} onExit={exitMatch} />;
  } else if (hostCode) {
    body = <Waiting code={hostCode} onMatch={enterMatch} onClosed={clearWaiting} />;
  } else {
    body = <Lobby onWaiting={startWaiting} onMatch={enterMatch} />;
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff479b]">{t("header.eyebrow")}</span>
        <h1 className="font-['Cairo'] text-3xl sm:text-4xl font-black text-white">{t("header.title")}</h1>
        {!matchId && <p className="text-sm sm:text-base text-[#e2e2ea]/80 max-w-2xl">{t("header.subtitle")}</p>}
      </header>
      {body}
    </section>
  );
};
