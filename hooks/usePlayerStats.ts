"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { IPlayerStats } from "@/types/player";

export function usePlayerStats() {
  const playerId = useAuthStore((state) => state.player?.id);

  return useQuery({
    queryKey: ["playerStats", playerId],
    queryFn: () => apiFetch<IPlayerStats>(apiPaths.proxy("/player/me/stats")),
    enabled: Boolean(playerId),
  });
}
