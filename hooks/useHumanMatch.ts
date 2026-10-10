"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, apiPaths } from "@/lib/api";
import type { IMatchView, TActiveMatch } from "@/types/room";

const MATCH_POLL_MS = 2000;

/** The player's unfinished match, if any: lets a reload or a second device resume a private duel. */
export function useActiveMatch(enabled = true) {
  return useQuery({
    queryKey: ["activeMatch"],
    queryFn: () => apiFetch<TActiveMatch>(apiPaths.proxy("/match/active")),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

/** Server-authoritative match state, polled until the match ends. */
export function useMatchView(matchId: string | null) {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: () => apiFetch<IMatchView>(apiPaths.proxy(`/match/${matchId}`)),
    enabled: Boolean(matchId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "FINISHED" || status === "CANCELLED" ? false : MATCH_POLL_MS;
    },
    retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
  });
}

function useMatchMutation<TVars>(matchId: string, request: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    // Success or rejection, the server's state is the truth: refresh it right away.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      void queryClient.invalidateQueries({ queryKey: ["activeMatch"] });
      void queryClient.invalidateQueries({ queryKey: ["playerStats"] });
      void queryClient.invalidateQueries({ queryKey: ["matchHistory"] });
    },
  });
}

export function useSetSecret(matchId: string) {
  return useMatchMutation(matchId, (body: { secret: string } | { random: true }) =>
    apiFetch<unknown>(apiPaths.proxy(`/match/${matchId}/secret`), { method: "POST", body: JSON.stringify(body) }),
  );
}

export function useSubmitMove(matchId: string) {
  return useMatchMutation(matchId, (guess: string) =>
    apiFetch<unknown>(apiPaths.proxy(`/match/${matchId}/move`), { method: "POST", body: JSON.stringify({ guess }) }),
  );
}

export function useForfeitMatch(matchId: string) {
  return useMatchMutation(matchId, () => apiFetch<unknown>(apiPaths.proxy(`/match/${matchId}/forfeit`), { method: "POST" }));
}
