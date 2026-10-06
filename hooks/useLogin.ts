"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { useAuthStore } from "@/store/useAuthStore";
import type { ILoginPayload, ISessionResponse } from "@/types/auth";

export function useLogin() {
  const queryClient = useQueryClient();
  const setPlayer = useAuthStore((state) => state.setPlayer);

  return useMutation({
    mutationFn: (payload: ILoginPayload) =>
      apiFetch<ISessionResponse>(apiPaths.auth("/login"), {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      if (!data.player) return;
      // Drop anything cached for a previous identity before storing the new one.
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
      setPlayer(data.player);
    },
  });
}
