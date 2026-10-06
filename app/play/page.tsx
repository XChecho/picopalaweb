"use client";

import { PlayHubView, type IActiveSession } from "@/components/views/PlayHubView";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { MAX_ATTEMPTS, TIMER_SECONDS, useMatchStore } from "@/store/useMatchStore";

export default function PlayPage() {
  const { startMatch, resumeMatch } = useAppNavigation();
  const isAuthenticated = useRequireAuth();
  const player = useAuthStore((state) => state.player);
  const stats = usePlayerStats();
  const hasActiveMatch = useAppStore((state) => state.hasActiveMatch);
  const phase = useMatchStore((state) => state.phase);
  const difficulty = useMatchStore((state) => state.difficulty);
  const attemptsLeft = useMatchStore((state) => state.playerAttemptsLeft);

  if (!isAuthenticated || !player) return null;

  const session: IActiveSession | null =
    hasActiveMatch && phase === "playing"
      ? { difficulty, turn: Math.min(MAX_ATTEMPTS - attemptsLeft + 1, MAX_ATTEMPTS), maxTurns: MAX_ATTEMPTS }
      : null;

  return (
    <PlayHubView
      username={player.username}
      stats={stats.data}
      maxAttempts={MAX_ATTEMPTS}
      turnSeconds={TIMER_SECONDS}
      session={session}
      onStartMatch={startMatch}
      onResumeMatch={resumeMatch}
    />
  );
}
