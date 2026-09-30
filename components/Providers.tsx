"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/queryClient";
import "@/lib/i18n/config";
import { useAppStore } from "@/store/useAppStore";
import { detectLanguage } from "@/lib/i18n/detectLanguage";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const lang = useAppStore((state) => state.lang);
  const setLang = useAppStore((state) => state.setLang);

  // Pick the saved language (or the browser's) once on the client.
  useEffect(() => {
    setLang(detectLanguage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
