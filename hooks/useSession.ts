"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError, apiFetch, apiPaths } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ISessionResponse } from "@/types/auth";

export const SESSION_QUERY_KEY = ["session"] as const;

/** Resolves the cookie-backed session once on mount and mirrors it into `useAuthStore`. */
export function useSession() {
  const setPlayer = useAuthStore((state) => state.setPlayer);
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async (): Promise<ISessionResponse> => {
      try {
        return await apiFetch<ISessionResponse>(apiPaths.auth("/session"));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return { player: null };
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      if (query.data.player) setPlayer(query.data.player);
      else setAnonymous();
    } else if (query.isError) {
      setAnonymous();
    }
  }, [query.data, query.isError, setPlayer, setAnonymous]);

  return query;
}
