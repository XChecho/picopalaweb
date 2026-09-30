"use client";

import dynamic from "next/dynamic";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAppStore } from "@/store/useAppStore";

// The match starts with random secrets and timers, so the arena renders on the client only.
const ArenaView = dynamic(
  () => import("@/components/views/ArenaView").then((module) => module.ArenaView),
  { ssr: false },
);

export default function ArenaPage() {
  const { navigate } = useAppNavigation();
  const mode = useAppStore((state) => state.matchMode);
  const difficulty = useAppStore((state) => state.matchDifficulty);
  const setMatchActive = useAppStore((state) => state.setMatchActive);
  const finishMatch = useAppStore((state) => state.finishMatch);

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
