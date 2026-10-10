"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AppView, Difficulty, GameMode } from "@/types/game";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";

/** Views that need a signed-in player; anonymous visitors are sent to `/auth`. */
const PROTECTED_VIEWS: readonly AppView[] = ["play-hub", "room", "arena"];

export const VIEW_ROUTES: Record<AppView, string> = {
  landing: "/",
  "play-hub": "/play",
  room: "/room",
  live: "/live",
  arena: "/arena",
  records: "/records",
  "how-to-play": "/how-to-play",
  strategy: "/how-to-play/strategy",
  auth: "/auth",
  terms: "/terms",
  privacy: "/privacy",
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
  const requestArena = useAppStore((state) => state.requestArena);

  const navigate = useCallback(
    (view: AppView) => {
      const isAnonymous = useAuthStore.getState().status === "anonymous";
      const target: AppView = isAnonymous && PROTECTED_VIEWS.includes(view) ? "auth" : view;
      if (target !== "arena") requestArena(false);
      router.push(VIEW_ROUTES[target]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, requestArena],
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

  const resumeMatch = useCallback(() => {
    requestArena(true);
    navigate("arena");
  }, [navigate, requestArena]);

  return { navigate, startMatch, resumeMatch };
}
