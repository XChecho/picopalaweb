"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/queryClient";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

function detectLocale(): Locale | null {
  try {
    const saved = localStorage.getItem("appLanguage");
    if (saved && LOCALES.includes(saved as Locale)) return saved as Locale;
  } catch {}
  const browser = navigator.language.slice(0, 2);
  return LOCALES.includes(browser as Locale) ? (browser as Locale) : null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    const detected = detectLocale();
    if (detected) useLocaleStore.setState({ locale: detected });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
