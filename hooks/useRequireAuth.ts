"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VIEW_ROUTES } from "@/hooks/useAppNavigation";
import { useAuthStore } from "@/store/useAuthStore";

/** Redirects anonymous visitors to `/auth`. Returns true once a signed-in player is confirmed. */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "anonymous") router.replace(VIEW_ROUTES.auth);
  }, [status, router]);

  return status === "authenticated";
}
