"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { useAuthStore } from "@/store/useAuthStore";
import type { IRegisterPayload, ISessionResponse } from "@/types/auth";

export function useRegister() {
  const queryClient = useQueryClient();
  const setPlayer = useAuthStore((state) => state.setPlayer);

  return useMutation({
    mutationFn: (payload: IRegisterPayload) =>
      apiFetch<ISessionResponse>(apiPaths.auth("/register"), {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      if (!data.player) return;
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
      setPlayer(data.player);
    },
  });
}
