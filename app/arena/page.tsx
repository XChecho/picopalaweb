"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (isAuthenticated && !arenaRequested) router.replace(VIEW_ROUTES["play-hub"]);
  }, [isAuthenticated, arenaRequested, router]);

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
