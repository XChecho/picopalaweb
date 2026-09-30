"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocaleStore } from "@/store/useLocaleStore";

interface IWaitlistResponse {
  subscribed: boolean;
}

// Requires backend endpoint POST /public/waitlist (see docs/web-endpoints-plan.md)
export function useWaitlist() {
  const locale = useLocaleStore((state) => state.locale);

  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<IWaitlistResponse>("/public/waitlist", {
        method: "POST",
        body: JSON.stringify({ email, locale, source: "web" }),
      }),
  });
}
