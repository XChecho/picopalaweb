"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { IMatchHistoryResponse, TApiGameMode, TMatchModeFilter } from "@/types/player";

export const MATCH_HISTORY_PAGE_SIZE = 10;

const MODE_PARAM: Record<Exclude<TMatchModeFilter, "all">, TApiGameMode> = {
  ai: "VERSUS_AI",
  private: "PRIVATE",
  global: "GLOBAL",
};

export function useMatchHistory(mode: TMatchModeFilter) {
  const playerId = useAuthStore((state) => state.player?.id);

  return useInfiniteQuery({
    queryKey: ["matchHistory", playerId, mode],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: String(MATCH_HISTORY_PAGE_SIZE),
        offset: String(pageParam),
        status: "FINISHED",
      });
      if (mode !== "all") params.set("mode", MODE_PARAM[mode]);
      return apiFetch<IMatchHistoryResponse>(apiPaths.proxy(`/player/me/matches?${params.toString()}`));
    },
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.matches.length;
      return lastPage.matches.length > 0 && next < lastPage.total ? next : undefined;
    },
    enabled: Boolean(playerId),
  });
}
