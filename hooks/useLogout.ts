"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { useAuthStore } from "@/store/useAuthStore";

export function useLogout() {
  const queryClient = useQueryClient();
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  return useMutation({
    mutationFn: () => apiFetch<{ ok: boolean }>(apiPaths.auth("/logout"), { method: "POST" }),
    // Cookies are cleared server-side even if the backend call failed, so always reset locally.
    onSettled: () => {
      setAnonymous();
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, { player: null });
    },
  });
}
