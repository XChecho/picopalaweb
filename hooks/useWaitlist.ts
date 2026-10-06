"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch, apiPaths } from "@/lib/api";

interface IWaitlistPayload {
  email: string;
  /** Single-use Turnstile token. */
  captchaToken?: string;
}

interface IWaitlistResponse {
  subscribed: boolean;
}

// Requires backend endpoint POST /public/waitlist (see docs/web-endpoints-plan.md)
export function useWaitlist() {
  return useMutation({
    mutationFn: ({ email, captchaToken }: IWaitlistPayload) =>
      apiFetch<IWaitlistResponse>(apiPaths.proxy("/public/waitlist"), {
        method: "POST",
        body: JSON.stringify({ email, source: "web", captchaToken }),
      }),
  });
}
