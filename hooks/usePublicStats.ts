"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface IPublicStats {
  totalPlayers: number;
  totalMatches: number;
  matchesToday: number;
}

// Requires backend endpoint GET /public/stats (see docs/web-endpoints-plan.md)
export function usePublicStats() {
  return useQuery({
    queryKey: ["publicStats"],
    queryFn: () => apiFetch<IPublicStats>("/public/stats"),
  });
}
