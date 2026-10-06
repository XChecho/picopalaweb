"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, apiPaths } from "@/lib/api";
import type { IMatchRecord } from "@/lib/matchRecord";

const MAX_RETRIES = 2;

/**
 * Persists a finished web match. The web always has a connection, so every match must be stored;
 * the backend dedupes by `clientMatchId`, which makes retries safe.
 */
export function useSaveMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: IMatchRecord) =>
      apiFetch<unknown>(apiPaths.proxy("/stats/sync"), {
        method: "POST",
        body: JSON.stringify({ matches: [record] }),
      }),
    // Retry network/5xx failures only; a 4xx means the payload itself was rejected.
    retry: (failureCount, error) =>
      failureCount < MAX_RETRIES && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playerStats"] });
      void queryClient.invalidateQueries({ queryKey: ["matchHistory"] });
    },
  });
}
