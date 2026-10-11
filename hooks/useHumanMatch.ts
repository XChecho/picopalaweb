"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, apiPaths } from "@/lib/api";
import type { IMatchView, TActiveMatch } from "@/types/room";

const MATCH_POLL_MS = 2000;
/** A finished duel keeps being read, slower, so a rematch offer from the rival shows up. */
const FINISHED_POLL_MS = 4000;

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
      if (status === "CANCELLED") return false;
      return status === "FINISHED" ? FINISHED_POLL_MS : MATCH_POLL_MS;
    },
    retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
  });
}

function useMatchMutation<TVars>(matchId: string, request: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    // Success or rejection, the server's state is the truth: refresh it right away.
    // Returned so the mutation stays pending until the fresh state arrives: no double submit in between.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
        queryClient.invalidateQueries({ queryKey: ["activeMatch"] }),
        queryClient.invalidateQueries({ queryKey: ["playerStats"] }),
        queryClient.invalidateQueries({ queryKey: ["matchHistory"] }),
      ]),
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

/** Offers a rematch: the backend opens a private room and exposes its code to the rival through the match view. */
export function useRequestRematch(matchId: string) {
  return useMatchMutation(matchId, () =>
    apiFetch<unknown>(apiPaths.proxy(`/match/${matchId}/rematch`), { method: "POST" }),
  );
}
