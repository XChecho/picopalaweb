"use client";

import { useEffect, useState } from "react";

/** Whole seconds left until `deadlineIso` (never negative), ticking every second. Null without a deadline. */
export function useCountdown(deadlineIso: string | null | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadlineIso) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadlineIso]);

  if (!deadlineIso) return null;
  return Math.max(0, Math.ceil((new Date(deadlineIso).getTime() - now) / 1000));
}
