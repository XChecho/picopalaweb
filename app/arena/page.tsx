"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { VIEW_ROUTES, useAppNavigation } from "@/hooks/useAppNavigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAppStore } from "@/store/useAppStore";

// The match starts with random secrets and timers, so the arena renders on the client only.
const ArenaView = dynamic(
  () => import("@/components/views/ArenaView").then((module) => module.ArenaView),
  { ssr: false },
);

export default function ArenaPage() {
  const router = useRouter();
  const { navigate } = useAppNavigation();
  const isAuthenticated = useRequireAuth();
  const arenaRequested = useAppStore((state) => state.arenaRequested);
  const mode = useAppStore((state) => state.matchMode);
  const difficulty = useAppStore((state) => state.matchDifficulty);
  const setMatchActive = useAppStore((state) => state.setMatchActive);
  const finishMatch = useAppStore((state) => state.finishMatch);

  // The arena is only reachable through "play" or "resume"; a bare visit goes back to the hub.
  // Judged once on entry: leaving the arena clears `arenaRequested` before the next route is
  // rendered, and reacting to that would bounce every exit (e.g. the header links) to the hub.
  const requestedOnEntry = useRef<boolean | null>(null);
  if (isAuthenticated && requestedOnEntry.current === null) requestedOnEntry.current = arenaRequested;
  useEffect(() => {
    if (requestedOnEntry.current === false) router.replace(VIEW_ROUTES["play-hub"]);
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !arenaRequested) return null;

  return (
    <ArenaView
      mode={mode}
      difficulty={difficulty}
      onMatchStart={() => setMatchActive(true)}
      onMatchComplete={() => finishMatch()}
      onExitArena={() => navigate("play-hub")}
    />
  );
}
