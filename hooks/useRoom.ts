"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, apiPaths } from "@/lib/api";
import type { IRoomCreated, IRoomJoined, IRoomState } from "@/types/room";

const ROOM_POLL_MS = 2000;

export function useCreateRoom() {
  return useMutation({
    mutationFn: () => apiFetch<IRoomCreated>(apiPaths.proxy("/room/private"), { method: "POST", body: JSON.stringify({}) }),
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch<IRoomJoined>(apiPaths.proxy("/room/private/join"), { method: "POST", body: JSON.stringify({ code }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["activeMatch"] }),
  });
}

export function useCancelRoom() {
  return useMutation({
    mutationFn: (code: string) => apiFetch<unknown>(apiPaths.proxy(`/room/private/${code}`), { method: "DELETE" }),
  });
}

/** Polls the host's waiting room until a guest joins (the backend then reports `matchId`). */
export function useRoomState(code: string | null) {
  return useQuery({
    queryKey: ["room", code],
    queryFn: () => apiFetch<IRoomState>(apiPaths.proxy(`/room/private/${code}`)),
    enabled: Boolean(code),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "IN_GAME" || status === "CLOSED" || status === "EXPIRED" ? false : ROOM_POLL_MS;
    },
    // A 404 means the room is gone; retrying would only delay clearing it.
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });
}
