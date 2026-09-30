"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface IWaitlistResponse {
  subscribed: boolean;
}

// Requires backend endpoint POST /public/waitlist (see docs/web-endpoints-plan.md)
export function useWaitlist() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<IWaitlistResponse>("/public/waitlist", {
        method: "POST",
        body: JSON.stringify({ email, source: "web" }),
      }),
  });
}
