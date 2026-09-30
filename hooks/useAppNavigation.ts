"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AppView, Difficulty, GameMode } from "@/types/game";
import { useAppStore } from "@/store/useAppStore";
import { useMatchStore } from "@/store/useMatchStore";

export const VIEW_ROUTES: Record<AppView, string> = {
  landing: "/",
  "play-hub": "/play",
  arena: "/arena",
  records: "/records",
  "how-to-play": "/how-to-play",
  auth: "/auth",
};

export function viewFromPathname(pathname: string): AppView {
  const entry = (Object.entries(VIEW_ROUTES) as [AppView, string][]).find(
    ([, route]) => route === pathname,
  );
  return entry ? entry[0] : "landing";
}

export function useAppNavigation() {
  const router = useRouter();
  const startMatchInStore = useAppStore((state) => state.startMatch);

  const navigate = useCallback(
    (view: AppView) => {
      router.push(VIEW_ROUTES[view]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  const startMatch = useCallback(
    (mode: GameMode, difficulty?: Difficulty) => {
      // A new match request always discards any match still in memory.
      useMatchStore.getState().reset();
      startMatchInStore(mode, difficulty);
      navigate("arena");
    },
    [navigate, startMatchInStore],
  );

  const resumeMatch = useCallback(() => navigate("arena"), [navigate]);

  return { navigate, startMatch, resumeMatch };
}
