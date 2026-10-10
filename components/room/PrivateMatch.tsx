"use client";

import React, { useState } from "react";
import { Dices, Flag, Lock, Timer, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DigitPad } from "@/components/room/DigitPad";
import { useForfeitMatch, useMatchView, useSetSecret, useSubmitMove } from "@/hooks/useHumanMatch";
import { useCountdown } from "@/hooks/useCountdown";
import { roomErrorKey } from "@/lib/roomErrors";
import { useAuthStore } from "@/store/useAuthStore";
import type { IMatchView, IMoveView } from "@/types/room";

interface PrivateMatchProps {
  matchId: string;
  onExit: () => void;
}

const card = "rounded-3xl bg-[#191b21] border border-[#282a30] p-4 sm:p-6";

function Feedback({ picos, palas }: { picos: number; palas: number }) {
  const { t } = useTranslation("room");
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold">
      <span className="px-2 py-0.5 rounded-full bg-[#ff479b]/15 text-[#ffb0ca]" title={t("match.picosLabel")}>
        {picos} {t("match.pico")}
      </span>
      <span className="px-2 py-0.5 rounded-full bg-[#00d2ff]/15 text-[#a5e7ff]" title={t("match.palasLabel")}>
        {palas} {t("match.pala")}
      </span>
    </span>
  );
}

function MoveColumn({ title, moves, testId }: { title: string; moves: IMoveView[]; testId: string }) {
  const { t } = useTranslation("room");
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2" data-testid={testId}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a98891]">{title}</h3>
      {moves.length === 0 && <p className="text-xs text-[#a98891]/70">{t("match.noMoves")}</p>}
      {moves.map((move) => (
        <div
          key={move.id}
          data-testid="room-move"
          data-seat={move.seat ?? ""}
          data-guess={move.guess}
          data-picos={move.picos}
          data-palas={move.palas}
          className="flex items-center justify-between gap-2 rounded-xl bg-[#111319] border border-[#282a30] px-3 py-2"
        >
          <span className="font-['Cairo'] text-lg font-black tracking-widest text-white">{move.guess}</span>
          <Feedback picos={move.picos} palas={move.palas} />
        </div>
      ))}
    </div>
  );
}

function SecretStep({ view, matchId, secondsLeft }: { view: IMatchView; matchId: string; secondsLeft: number | null }) {
  const { t } = useTranslation("room");
  const [draft, setDraft] = useState<number[]>([]);
  const setSecret = useSetSecret(matchId);
  const mySecret = view.mySeat === 1 ? view.player1Number : view.player2Number;

  if (mySecret) {
    return (
      <div className={`${card} flex flex-col items-center gap-3 text-center`} data-testid="secret-locked">
        <Lock className="w-8 h-8 text-[#a5e7ff]" />
        <p className="font-['Cairo'] text-lg font-black text-white tracking-[0.3em]">{mySecret}</p>
        <p className="text-sm text-[#e2bdc7]">{t("secret.waitingRival")}</p>
        {secondsLeft !== null && <p className="text-xs text-[#a98891]">{t("secret.timeLeft", { seconds: secondsLeft })}</p>}
      </div>
    );
  }

  const lock = () => setSecret.mutate({ secret: draft.join("") });
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-['Cairo'] text-2xl font-black text-white">{t("secret.title")}</h2>
        <p className="text-sm text-[#a98891]">{t("secret.subtitle")}</p>
        {secondsLeft !== null && <p className="text-xs font-bold text-[#ffe170]">{t("secret.timeLeft", { seconds: secondsLeft })}</p>}
      </div>
      <DigitPad
        draft={draft}
        onChange={setDraft}
        onSubmit={lock}
        disabled={setSecret.isPending}
        submitLabel={t("secret.lock")}
        secondary={
          <button
            type="button"
            onClick={() => setSecret.mutate({ random: true })}
            disabled={setSecret.isPending}
            data-testid="secret-random"
            className="h-11 px-3 shrink-0 rounded-xl bg-[#111319] border border-[#00d2ff]/40 text-[#a5e7ff] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40"
          >
            <Dices className="w-4 h-4" /> {t("secret.random")}
          </button>
        }
      />
      {setSecret.isError && (
        <p role="alert" className="text-sm text-rose-400 font-bold text-center">
          {t(roomErrorKey(setSecret.error))}
        </p>
      )}
    </div>
  );
}

export const PrivateMatch: React.FC<PrivateMatchProps> = ({ matchId, onExit }) => {
  const { t } = useTranslation("room");
  const playerId = useAuthStore((state) => state.player?.id);
  const { data: view, isError, isPending, failureCount } = useMatchView(matchId);
  const submitMove = useSubmitMove(matchId);
  const forfeit = useForfeitMatch(matchId);
  const [draft, setDraft] = useState<number[]>([]);
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const secondsLeft = useCountdown(view?.turnDeadlineAt);

  if (isPending) return <p className="text-center text-[#a98891]">{t("loading")}</p>;
  if (isError || !view) {
    return (
      <div className={`${card} flex flex-col items-center gap-4 text-center`}>
        <p role="alert" className="text-rose-400 font-bold">{t("errors.notFound")}</p>
        <button onClick={onExit} className="px-6 py-2.5 rounded-full bg-[#282a30] text-white text-xs font-bold uppercase tracking-wider">
          {t("result.back")}
        </button>
      </div>
    );
  }

  const mySeat = view.mySeat;
  const mine = view.moves.filter((move) => move.seat === mySeat);
  const theirs = view.moves.filter((move) => move.seat !== mySeat);

  if (view.status === "FINISHED" || view.status === "CANCELLED") {
    const outcome =
      view.status === "CANCELLED" ? "cancelled" : view.winnerId === null ? "draw" : view.winnerId === playerId ? "win" : "loss";
    return (
      <div className="flex flex-col gap-4">
        <div className={`${card} flex flex-col items-center gap-2 text-center`}>
          <Trophy className={`w-10 h-10 ${outcome === "win" ? "text-[#ffe170]" : "text-[#a98891]"}`} />
          <h2 data-testid="room-result" data-result={outcome} className="font-['Cairo'] text-3xl font-black text-white">
            {t(`result.${outcome}`)}
          </h2>
          <p className="text-sm text-[#e2bdc7]">{t(`result.reason.${view.endReason ?? "none"}`)}</p>
          <button
            onClick={onExit}
            className="mt-3 px-8 py-3 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-black text-xs uppercase tracking-wider"
          >
            {t("result.back")}
          </button>
        </div>
        <div className={`${card} flex gap-4`}>
          <MoveColumn title={t("match.you")} moves={mine} testId="column-you" />
          <MoveColumn title={t("match.rival")} moves={theirs} testId="column-rival" />
        </div>
      </div>
    );
  }

  if (view.status === "WAITING") {
    return <SecretStep view={view} matchId={matchId} secondsLeft={secondsLeft} />;
  }

  const myTurn = view.currentSeat === mySeat;
  const mySecret = mySeat === 1 ? view.player1Number : view.player2Number;
  const submit = () => {
    if (draft.length !== 4 || !myTurn) return;
    submitMove.mutate(draft.join(""), { onSuccess: () => setDraft([]) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex flex-col">
          <span
            data-testid="match-status"
            data-state={myTurn ? "your-turn" : "rival-turn"}
            className={`font-['Cairo'] text-xl font-black ${myTurn ? "text-[#ffb0ca]" : "text-[#a5e7ff]"}`}
          >
            {myTurn ? t("match.yourTurn") : t("match.rivalTurn")}
          </span>
          <span className="text-xs text-[#a98891]">
            {t("match.turn", { n: Math.min(mine.length + 1, view.maxTurns), max: view.maxTurns })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {mySecret && (
            <span className="text-xs text-[#a98891]">
              {t("match.mySecret")}: <b data-testid="my-secret" className="text-white tracking-widest">{mySecret}</b>
            </span>
          )}
          {secondsLeft !== null && (
            <span
              data-testid="turn-timer"
              className={`flex items-center gap-1.5 font-['Cairo'] text-xl font-black ${secondsLeft <= 10 ? "text-rose-400" : "text-white"}`}
            >
              <Timer className="w-4 h-4" /> {t("match.timeLeft", { seconds: secondsLeft })}
            </span>
          )}
        </div>
      </div>

      <div className={`${card} flex gap-4`}>
        <MoveColumn title={t("match.you")} moves={mine} testId="column-you" />
        <MoveColumn title={t("match.rival")} moves={theirs} testId="column-rival" />
      </div>

      <div className={`${card} flex flex-col gap-3 ${myTurn ? "border-[#ff479b]/40" : "opacity-70"}`}>
        <p className="text-xs text-center text-[#a98891]">
          {myTurn ? t("match.hint", { count: Math.max(0, 4 - draft.length) }) : t("match.rivalTurn")}
        </p>
        <DigitPad
          draft={draft}
          onChange={setDraft}
          onSubmit={submit}
          disabled={!myTurn || submitMove.isPending}
          submitLabel={t("match.submit")}
        />
        {submitMove.isError && (
          <p role="alert" className="text-sm text-rose-400 font-bold text-center">
            {t(roomErrorKey(submitMove.error))}
          </p>
        )}
        {failureCount > 0 && <p className="text-xs text-center text-[#ffe170]">{t("match.connectionLost")}</p>}
      </div>

      <button
        onClick={() => setConfirmForfeit(true)}
        className="self-center flex items-center gap-2 px-5 py-2 rounded-full border border-[#33353b] text-[#a98891] hover:text-rose-400 hover:border-rose-400/50 text-xs font-bold uppercase tracking-wider transition-all"
      >
        <Flag className="w-4 h-4" /> {t("match.forfeit")}
      </button>

      <ConfirmDialog
        open={confirmForfeit}
        title={t("forfeitDialog.title")}
        description={t("forfeitDialog.description")}
        confirmLabel={t("forfeitDialog.confirm")}
        cancelLabel={t("forfeitDialog.cancel")}
        busy={forfeit.isPending}
        onConfirm={() => forfeit.mutate(undefined, { onSettled: () => setConfirmForfeit(false) })}
        onCancel={() => setConfirmForfeit(false)}
      />
    </div>
  );
};
